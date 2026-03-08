import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    // Admin 권한 확인
    await requireAdmin();

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const cityId = searchParams.get('city_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('workspace_suggestions')
      .select(
        `
        *,
        cities(name, name_en),
        users!workspace_suggestions_user_id_fkey(display_name, email)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (cityId) {
      query = query.eq('city_id', cityId);
    }

    const { data: suggestions, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ suggestions, total: count || 0 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '권한 없음' },
      { status: 403 }
    );
  }
}
