import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { getPublicUrl } from '@/lib/supabase-storage';

interface Suggestion {
  id: string;
  name: string;
  city_id: string;
  cities: {
    name: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  image_path?: string;
  created_at: string;
}

const statusConfig = {
  pending: { label: '검토 중', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
  approved: { label: '승인됨', color: 'bg-green-100', textColor: 'text-green-800' },
  rejected: { label: '거절됨', color: 'bg-red-100', textColor: 'text-red-800' },
};

export default async function MySuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/my-suggestions');
  }

  const params = await searchParams;
  const statusFilter = params.status;

  // 제안 목록 조회
  let query = supabase
    .from('workspace_suggestions')
    .select('*, cities(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
    query = query.eq('status', statusFilter);
  }

  const { data: suggestions } = await query;
  const typedSuggestions = (suggestions || []) as Suggestion[];

  const pendingCount = typedSuggestions.filter((s) => s.status === 'pending').length;
  const approvedCount = typedSuggestions.filter((s) => s.status === 'approved').length;
  const rejectedCount = typedSuggestions.filter((s) => s.status === 'rejected').length;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">내 작업공간 제안</h1>
          <Link href="/suggest-workspace">
            <Button>새로운 제안</Button>
          </Link>
        </div>

        {/* 상태 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/my-suggestions">
            <Button
              variant={!statusFilter ? 'default' : 'outline'}
              size="sm"
            >
              전체 ({typedSuggestions.length})
            </Button>
          </Link>
          <Link href="/my-suggestions?status=pending">
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
            >
              검토 중 ({pendingCount})
            </Button>
          </Link>
          <Link href="/my-suggestions?status=approved">
            <Button
              variant={statusFilter === 'approved' ? 'default' : 'outline'}
              size="sm"
            >
              승인됨 ({approvedCount})
            </Button>
          </Link>
          <Link href="/my-suggestions?status=rejected">
            <Button
              variant={statusFilter === 'rejected' ? 'default' : 'outline'}
              size="sm"
            >
              거절됨 ({rejectedCount})
            </Button>
          </Link>
        </div>

        {/* 제안 목록 */}
        <div className="space-y-4">
          {typedSuggestions.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">제안이 없습니다.</p>
              <Link href="/suggest-workspace">
                <Button variant="outline">새로운 제안하기</Button>
              </Link>
            </div>
          ) : (
            typedSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                supabase={supabase}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function SuggestionCard({
  suggestion,
  supabase,
}: {
  suggestion: Suggestion;
  supabase: any;
}) {
  const config = statusConfig[suggestion.status];
  const imageUrl = suggestion.image_path ? getPublicUrl(supabase, suggestion.image_path) : null;

  return (
    <div className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {imageUrl && (
          <div className="sm:w-32 h-32 flex-shrink-0 relative">
            <Image
              src={imageUrl}
              alt={suggestion.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 128px"
            />
          </div>
        )}

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold">{suggestion.name}</h3>
              <p className="text-sm text-gray-600">{suggestion.cities.name}</p>
            </div>
            <span
              className={`inline-block px-3 py-1 text-xs font-medium rounded ${config.color} ${config.textColor}`}
            >
              {config.label}
            </span>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            제출일: {new Date(suggestion.created_at).toLocaleDateString('ko-KR')}
          </p>

          {suggestion.admin_note && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
              <p className="text-xs font-semibold text-red-800 mb-1">거절 사유:</p>
              <p className="text-sm text-red-700">{suggestion.admin_note}</p>
            </div>
          )}

          {suggestion.status === 'pending' && (
            <p className="text-xs text-gray-600 italic">
              관리자 검토 중입니다. 검토 결과는 이메일로 안내됩니다.
            </p>
          )}

          {suggestion.status === 'approved' && (
            <p className="text-xs text-green-700">✅ 축하합니다! 작업공간이 플랫폼에 추가되었습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
