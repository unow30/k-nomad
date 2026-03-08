import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ToggleWorkspaceVisibilityButton } from './ToggleWorkspaceVisibilityButton';

export default async function AdminWorkspacesPage() {
  const supabase = await createClient();

  // 모든 작업공간 조회
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select(`
      *,
      cities (
        name,
        name_en
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">작업공간 목록을 불러오는데 실패했습니다.</p>
        <p className="text-sm text-gray-600 mt-2">{error.message}</p>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    cafe: '카페',
    coworking: '코워킹',
    library: '도서관',
    hotel_lobby: '호텔 로비',
    other: '기타',
  };

  const priceLabels: Record<string, string> = {
    free: '무료',
    low: '저렴',
    medium: '보통',
    high: '비쌈',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">작업공간 관리</h1>
          <p className="mt-2 text-gray-600">
            총 {workspaces?.length || 0}개의 작업공간이 등록되어 있습니다.
          </p>
        </div>
        <Link href="/admin/workspaces/new">
          <Button>➕ 새 작업공간 추가</Button>
        </Link>
      </div>

      {/* 작업공간 목록 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업공간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                도시
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                타입
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                WiFi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가격
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                평점
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workspaces && workspaces.length > 0 ? (
              workspaces.map((workspace: any) => (
                <tr
                  key={workspace.id}
                  className={`hover:bg-gray-50 ${
                    workspace.is_hidden ? 'bg-gray-100 opacity-60' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {workspace.image_url && (
                        <div className="flex-shrink-0 h-10 w-10 relative mr-3">
                          <Image
                            src={workspace.image_url}
                            alt={workspace.name}
                            fill
                            className="rounded object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {workspace.name}
                          {workspace.is_hidden && (
                            <span className="px-2 py-0.5 text-xs bg-gray-500 text-white rounded">
                              숨김
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {workspace.name_en}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {workspace.cities?.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {typeLabels[workspace.type] || workspace.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {workspace.wifi_speed ? `${workspace.wifi_speed}Mbps` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {priceLabels[workspace.price_range] || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ⭐ {workspace.average_rating?.toFixed(1) || '0.0'}
                      <span className="text-gray-500 ml-1">
                        ({workspace.review_count || 0})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/workspaces/${workspace.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      수정
                    </Link>
                    <ToggleWorkspaceVisibilityButton
                      workspaceId={workspace.id}
                      workspaceName={workspace.name}
                      isHidden={workspace.is_hidden || false}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  등록된 작업공간이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
