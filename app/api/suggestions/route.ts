import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { uploadSuggestionImage, deleteImage } from '@/lib/supabase-storage';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // FormData 파싱
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    // 임시 suggestion_id 생성 (이미지 업로드용)
    const suggestionId = crypto.randomUUID();

    let imagePath: string | undefined;

    // 이미지 업로드 (있는 경우)
    if (image && image.size > 0) {
      const uploadResult = await uploadSuggestionImage(supabase, suggestionId, image);
      if (!uploadResult.success) {
        return NextResponse.json({ error: uploadResult.error }, { status: 400 });
      }
      imagePath = uploadResult.path;
    }

    // DB에 제안 삽입
    const { data: suggestion, error: insertError } = await supabase
      .from('workspace_suggestions')
      .insert({
        id: suggestionId,
        user_id: user.id,
        city_id: formData.get('city_id') as string,
        name: formData.get('name') as string,
        name_en: formData.get('name_en') || null,
        type: formData.get('type') as any,
        address: formData.get('address') as string,
        description: formData.get('description') || null,
        wifi_speed: formData.get('wifi_speed') ? parseInt(formData.get('wifi_speed') as string) : null,
        has_power: formData.get('has_power') === 'true',
        price_range: (formData.get('price_range') as string) || null,
        opening_hours: formData.get('opening_hours') || null,
        phone: formData.get('phone') || null,
        website: formData.get('website') || null,
        latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
        longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null,
        image_path: imagePath,
      })
      .select()
      .single();

    if (insertError) {
      // 실패 시 업로드된 이미지 삭제
      if (imagePath) {
        await deleteImage(supabase, imagePath);
      }
      return NextResponse.json(
        { error: `제안 제출 실패: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: suggestion }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '제안 제출 실패' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 쿼리 파라미터
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 내 제안 목록 조회
    let query = supabase
      .from('workspace_suggestions')
      .select('*, cities(name, name_en)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: suggestions, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ suggestions, total: count || 0 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '조회 실패' },
      { status: 500 }
    );
  }
}
