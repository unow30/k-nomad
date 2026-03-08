import { createClient } from '@/utils/supabase/server';
import { ReviewActions } from './ReviewActions';

export default async function AdminReviewsPage() {
  const supabase = await createClient();

  // 모든 리뷰 조회 (숨겨진 리뷰 포함)
  const { data: reviews, error } = await supabase
    .from('user_reviews')
    .select(`
      *,
      cities (
        name,
        name_en
      ),
      users (
        display_name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">리뷰 목록을 불러오는데 실패했습니다.</p>
        <p className="text-sm text-gray-600 mt-2">{error.message}</p>
      </div>
    );
  }

  const hiddenCount = reviews?.filter((r) => r.hidden).length || 0;
  const visibleCount = reviews?.filter((r) => !r.hidden).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">도시 리뷰 관리</h1>
        <p className="mt-2 text-gray-600">
          총 {reviews?.length || 0}개의 리뷰 (공개: {visibleCount}개, 숨김: {hiddenCount}
          개)
        </p>
      </div>

      {/* 필터 탭 */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium">
          전체 ({reviews?.length || 0})
        </button>
        <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
          공개 ({visibleCount})
        </button>
        <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
          숨김 ({hiddenCount})
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
                    <h3 className="text-lg font-semibold text-gray-900">
                      {review.title}
                    </h3>
                    <div className="flex items-center">
                      {'⭐'.repeat(review.rating)}
                      <span className="text-gray-400">
                        {'⭐'.repeat(5 - review.rating)}
                      </span>
                    </div>
                  </div>

                  {/* 도시 및 작성자 정보 */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className="font-medium">
                      📍 {review.cities?.name || '알 수 없음'}
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
                <ReviewActions
                  reviewId={review.id}
                  isHidden={review.hidden}
                  reviewTitle={review.title}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">등록된 리뷰가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
