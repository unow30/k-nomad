import { createClient } from '@/utils/supabase/server';
import { SuggestionForm } from '@/components/workspace/SuggestionForm';
import { redirect } from 'next/navigation';

export default async function SuggestWorkspacePage() {
  const supabase = await createClient();

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/suggest-workspace');
  }

  // 도시 목록 조회
  const { data: cities } = await supabase
    .from('cities')
    .select('id, name, name_en')
    .order('name');

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">작업공간 제안하기</h1>
          <p className="text-gray-600 mb-8">
            새로운 작업공간을 추천해주세요! 관리자 검토 후 승인되면 플랫폼에 등록됩니다.
          </p>

          <SuggestionForm cities={cities || []} />
        </div>
      </div>
    </main>
  );
}
