import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// pr 올려도 배포 안되는지 확인
export default async function AdminDashboard() {
  const supabase = await createClient();

  // 통계 데이터 조회
  const [citiesResult, workspacesResult, reviewsResult, usersResult] = await Promise.all([
    supabase.from('cities').select('id', { count: 'exact', head: true }),
    supabase.from('workspaces').select('id', { count: 'exact', head: true }),
    supabase.from('user_reviews').select('id, hidden', { count: 'exact' }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ]);

  const citiesCount = citiesResult.count || 0;
  const workspacesCount = workspacesResult.count || 0;
  const totalReviews = reviewsResult.count || 0;
  const hiddenReviews = reviewsResult.data?.filter((r) => r.hidden).length || 0;
  const usersCount = usersResult.count || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="mt-2 text-gray-600">시스템 전체 현황을 확인하고 관리하세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 도시</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{citiesCount}</div>
            <Link
              href="/admin/cities"
              className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
            >
              관리하기 →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">작업공간</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{workspacesCount}</div>
            <Link
              href="/admin/workspaces"
              className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
            >
              관리하기 →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">리뷰</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalReviews}</div>
            <p className="text-sm text-gray-600 mt-1">숨김: {hiddenReviews}개</p>
            <Link
              href="/admin/reviews"
              className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
            >
              관리하기 →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{usersCount}</div>
            <p className="text-sm text-gray-600 mt-1">전체 가입자</p>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 작업 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/cities/new"
            className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
          >
            <div className="text-lg font-semibold text-gray-900">➕ 새 도시 추가</div>
            <p className="text-sm text-gray-600 mt-2">새로운 노마드 도시를 추가합니다</p>
          </Link>

          <Link
            href="/admin/workspaces/new"
            className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
          >
            <div className="text-lg font-semibold text-gray-900">➕ 작업공간 추가</div>
            <p className="text-sm text-gray-600 mt-2">새로운 작업 공간을 등록합니다</p>
          </Link>

          <Link
            href="/"
            className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
          >
            <div className="text-lg font-semibold text-gray-900">👁️ 사용자 뷰</div>
            <p className="text-sm text-gray-600 mt-2">일반 사용자 화면을 확인합니다</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
