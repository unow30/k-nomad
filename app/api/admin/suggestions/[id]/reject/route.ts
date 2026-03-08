import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: suggestionId } = await params;
    const admin = await requireAdmin();
    const supabase = await createClient();

    const body = await request.json();
    const { admin_note } = body;

    if (!admin_note) {
      return NextResponse.json({ error: '거절 사유를 입력해주세요' }, { status: 400 });
    }

    // 제안 상태 업데이트
    const { error } = await supabase
      .from('workspace_suggestions')
      .update({
        status: 'rejected',
        admin_note,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', suggestionId)
      .eq('status', 'pending');  // pending 상태만 거절 가능

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/admin/suggestions');

    return NextResponse.json({ success: true, message: '제안이 거절되었습니다' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '거절 처리 실패' },
      { status: 500 }
    );
  }
}
