import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { copyImageToApproved, deleteImage } from '@/lib/supabase-storage';
import { revalidatePath } from 'next/cache';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: suggestionId } = await params;
    const admin = await requireAdmin();
    const supabase = await createClient();

    // 1. 제안 조회
    const { data: suggestion, error: fetchError } = await supabase
      .from('workspace_suggestions')
      .select('*')
      .eq('id', suggestionId)
      .single();

    if (fetchError || !suggestion) {
      return NextResponse.json({ error: '제안을 찾을 수 없습니다' }, { status: 404 });
    }

    if (suggestion.status !== 'pending') {
      return NextResponse.json({ error: '이미 처리된 제안입니다' }, { status: 400 });
    }

    // 2. 이미지 복사 (있는 경우)
    let imageUrl: string | null = null;
    let newImagePath: string | null = null;
    const newWorkspaceId = crypto.randomUUID();

    if (suggestion.image_path) {
      const copyResult = await copyImageToApproved(
        supabase,
        suggestion.image_path,
        newWorkspaceId
      );

      if (!copyResult.success) {
        return NextResponse.json(
          { error: `이미지 복사 실패: ${copyResult.error}` },
          { status: 500 }
        );
      }

      imageUrl = copyResult.publicUrl!;
      newImagePath = copyResult.newPath!;
    }

    // 3. 작업공간 생성
    const { data: workspace, error: createError } = await supabase
      .from('workspaces')
      .insert({
        id: newWorkspaceId,
        city_id: suggestion.city_id,
        name: suggestion.name,
        name_en: suggestion.name_en,
        type: suggestion.type,
        address: suggestion.address,
        description: suggestion.description,
        wifi_speed: suggestion.wifi_speed,
        has_power: suggestion.has_power,
        price_range: suggestion.price_range,
        opening_hours: suggestion.opening_hours,
        phone: suggestion.phone,
        website: suggestion.website,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        image_url: imageUrl,
        data_source: 'user_suggestion',
      })
      .select()
      .single();

    if (createError) {
      // 실패 시 복사된 이미지 삭제
      if (newImagePath) {
        await deleteImage(supabase, newImagePath);
      }
      return NextResponse.json(
        { error: `작업공간 생성 실패: ${createError.message}` },
        { status: 500 }
      );
    }

    // 4. 제안 상태 업데이트
    const { error: updateError } = await supabase
      .from('workspace_suggestions')
      .update({
        status: 'approved',
        approved_workspace_id: workspace.id,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', suggestionId);

    if (updateError) {
      // 생성된 작업공간 삭제 시도
      await supabase.from('workspaces').delete().eq('id', workspace.id);
      if (newImagePath) {
        await deleteImage(supabase, newImagePath);
      }
      return NextResponse.json(
        { error: `제안 상태 업데이트 실패: ${updateError.message}` },
        { status: 500 }
      );
    }

    // 캐시 무효화
    revalidatePath('/admin/workspaces');
    revalidatePath('/admin/suggestions');

    return NextResponse.json({
      success: true,
      workspaceId: workspace.id,
      message: '제안이 승인되었습니다',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '승인 처리 실패' },
      { status: 500 }
    );
  }
}
