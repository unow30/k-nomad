import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { WorkspaceReviewActions } from './WorkspaceReviewActions';

const PAGE_SIZE = 100;

export default async function AdminWorkspaceReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10));
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;

  const supabase = await createClient();

  // 페이지 데이터 + 전체 카운트를 한 번에 조회
  const { data: reviews, count, error } = await supabase
    .from('workspace_reviews')
    .select(
      `
      *,
      workspaces (
        name
      ),
      users (
        display_name,
        email
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">작업공간 리뷰 목록을 불러오는데 실패했습니다.</p>
        <p className="text-sm text-gray-600 mt-2">{error.message}</p>
      </div>
    );
  }

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hiddenCount = reviews?.filter((r) => r.hidden).length || 0;
  const visibleCount = reviews?.filter((r) => !r.hidden).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">작업공간 리뷰 관리</h1>
        <p className="mt-2 text-gray-600">
          총 {totalCount}개의 리뷰 · 이 페이지: 공개 {visibleCount}개, 숨김 {hiddenCount}개
        </p>
      </div>

      {/* 필터 탭 */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium">
          전체 ({totalCount})
        </button>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {reviews && reviews.length > 0 ? (
          reviews.map((review: any) => (
            <div
              key={review.id}
              className={`bg-white border rounded-lg p-6 ${
                review.hidden ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* 리뷰 헤더 */}
                  <div className="flex items-center space-x-3 mb-2">
                    {review.hidden && (
                      <span className="px-2 py-1 text-xs font-semibold bg-red-600 text-white rounded">
                        🔴 숨김
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
                    <div className="flex items-center">
                      {'⭐'.repeat(review.rating)}
                      <span className="text-gray-400">{'⭐'.repeat(5 - review.rating)}</span>
                    </div>
                  </div>

                  {/* 작업공간 및 작성자 정보 */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className="font-medium">
                      🏢 {review.workspaces?.name || '알 수 없음'}
                    </span>
                    <span>
                      👤 {review.users?.display_name || review.users?.email || '익명'}
                    </span>
                    <span>
                      📅{' '}
                      {new Date(review.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* 리뷰 내용 */}
                  <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
                </div>

                {/* 액션 버튼 */}
                <WorkspaceReviewActions
                  reviewId={review.id}
                  isHidden={review.hidden}
                  reviewTitle={review.title}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">등록된 작업공간 리뷰가 없습니다.</div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4">
          {currentPage > 1 && (
            <Link
              href={`?page=${currentPage - 1}`}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              이전
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`?page=${page}`}
              className={`w-9 h-9 flex items-center justify-center text-sm rounded ${
                page === currentPage
                  ? 'bg-blue-600 text-white font-medium'
                  : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {page}
            </Link>
          ))}

          {currentPage < totalPages && (
            <Link
              href={`?page=${currentPage + 1}`}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              다음
            </Link>
          )}
        </div>
      )}

      {/* 현재 페이지 정보 */}
      {totalPages > 1 && (
        <p className="text-center text-sm text-gray-500">
          {currentPage} / {totalPages} 페이지 · 총 {totalCount}개
        </p>
      )}
    </div>
  );
}
