import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ToggleCityVisibilityButton } from './ToggleCityVisibilityButton';

export default async function AdminCitiesPage() {
  const supabase = await createClient();

  // 모든 도시 조회
  const { data: cities, error } = await supabase
    .from('cities')
    .select('*')
    .order('rank', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">도시 목록을 불러오는데 실패했습니다.</p>
        <p className="text-sm text-gray-600 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">도시 관리</h1>
          <p className="mt-2 text-gray-600">
            총 {cities?.length || 0}개의 도시가 등록되어 있습니다.
          </p>
        </div>
        <Link href="/admin/cities/new">
          <Button>➕ 새 도시 추가</Button>
        </Link>
      </div>

      {/* 도시 목록 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                순위
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                도시
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                지역
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                평점
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                리뷰
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생활비
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cities && cities.length > 0 ? (
              cities.map((city) => (
                <tr
                  key={city.id}
                  className={`hover:bg-gray-50 ${
                    city.is_hidden ? 'bg-gray-100 opacity-60' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {city.rank || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {city.image_url && (
                        <div className="flex-shrink-0 h-10 w-10 relative mr-3">
                          <Image
                            src={city.image_url}
                            alt={city.name}
                            fill
                            className="rounded object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {city.name}
                          {city.is_hidden && (
                            <span className="px-2 py-0.5 text-xs bg-gray-500 text-white rounded">
                              숨김
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{city.name_en}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{city.province}</div>
                    <div className="text-sm text-gray-500">{city.region}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ⭐ {city.overall_score?.toFixed(1) || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{city.review_count || 0}개</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {city.monthly_budget
                        ? `${city.monthly_budget.toLocaleString()}만원`
                        : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/cities/${city.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      수정
                    </Link>
                    <ToggleCityVisibilityButton
                      cityId={city.id}
                      cityName={city.name}
                      isHidden={city.is_hidden || false}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  등록된 도시가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
