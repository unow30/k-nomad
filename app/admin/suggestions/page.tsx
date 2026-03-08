import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Suggestion {
  id: string;
  name: string;
  city_id: string;
  cities: {
    name: string;
  };
  users: {
    display_name: string | null;
    email: string;
  };
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; textColor: string }> = {
  pending: { label: '검토 중', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
  approved: { label: '승인됨', color: 'bg-green-100', textColor: 'text-green-800' },
  rejected: { label: '거절됨', color: 'bg-red-100', textColor: 'text-red-800' },
};

export default async function AdminSuggestionsPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: suggestions } = await supabase
    .from('workspace_suggestions')
    .select(
      `
      *,
      cities(name),
      users!workspace_suggestions_user_id_fkey(display_name, email)
    `
    )
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">작업공간 제안 관리</h1>

        {!suggestions || suggestions.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">제안이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    제안자
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    도시
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    작업공간명
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    제출일
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {(suggestions as Suggestion[]).map((suggestion) => {
                  const config = statusConfig[suggestion.status];
                  return (
                    <tr key={suggestion.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          {suggestion.users.display_name || suggestion.users.email}
                        </div>
                        <div className="text-gray-500 text-xs">{suggestion.users.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {suggestion.cities.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {suggestion.name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded ${config.color} ${config.textColor}`}
                        >
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(suggestion.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/admin/suggestions/${suggestion.id}`}>
                          <Button size="sm" variant="outline">
                            검토
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
