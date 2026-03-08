import { createClient } from '@/utils/supabase/server';
import { WorkspaceForm } from '../../WorkspaceForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 작업공간 데이터 조회
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !workspace) {
    notFound();
  }

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
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          작업공간 수정: {workspace.name}
        </h1>
        <p className="mt-2 text-gray-600">
          작업공간 정보를 수정합니다. 필수 항목(*)을 반드시 입력해주세요.
        </p>
      </div>

      <WorkspaceForm initialData={workspace} isEdit={true} cities={cities || []} />
    </div>
  );
}
