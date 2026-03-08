import { createClient } from '@/utils/supabase/server';
import { WorkspaceForm } from '../WorkspaceForm';
import Link from 'next/link';

export default async function NewWorkspacePage() {
  const supabase = await createClient();

  // 도시 목록 조회
  const { data: cities } = await supabase
    .from('cities')
    .select('id, name')
    .order('name', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/workspaces"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← 작업공간 목록으로
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">새 작업공간 추가</h1>
        <p className="mt-2 text-gray-600">
          새로운 작업 공간을 추가합니다. 필수 항목(*)을 반드시 입력해주세요.
        </p>
      </div>

      <WorkspaceForm cities={cities || []} />
    </div>
  );
}
