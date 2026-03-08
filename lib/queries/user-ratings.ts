import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

// ============================
// 사용자 평가 함수
// ============================

/**
 * 도시에 대한 사용자 평가 조회
 */
export async function getUserRating(supabase: SupabaseClient<Database>, cityId: string, userId: string) {
  const { data, error } = await supabase
    .from("user_ratings")
    .select("*")
    .eq("city_id", cityId)
    .eq("user_id", userId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * 평가 제출 또는 업데이트
 * 별점(overall_score)만 저장합니다.
 */
export async function submitRating(
  supabaseClient: SupabaseClient<Database>,
  cityId: string,
  userId: string,
  { overall_score }: { overall_score: number }
) {
  // UPSERT로 INSERT or UPDATE 자동 처리 (waterfall 제거)
  const { data: rating, error } = await supabaseClient
    .from("user_ratings")
    .upsert(
      {
        city_id: cityId,
        user_id: userId,
        overall_score,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "city_id,user_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit rating: ${error.message}`);
  }

  return rating;
}

/**
 * 평가 삭제
 * 트리거가 cities 테이블의 likes/dislikes를 자동 업데이트합니다.
 */
export async function deleteRating(
  supabaseClient: SupabaseClient<Database>,
  ratingId: string,
  userId: string
) {
  // 단순 DELETE만 수행 (waterfall 제거)
  const { error } = await supabaseClient
    .from("user_ratings")
    .delete()
    .eq("id", ratingId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete rating: ${error.message}`);
  }

  // 트리거가 자동으로 cities 테이블 업데이트
}

/**
 * 도시 평균 평점 계산
 */
export async function getCityAverageRating(supabase: SupabaseClient<Database>, cityId: string) {
  const { data, error } = await supabase
    .from("user_ratings")
    .select("overall_score")
    .eq("city_id", cityId);

  if (error || !data || data.length === 0) {
    return null;
  }

  const average =
    data.reduce((sum, r) => sum + (r.overall_score || 0), 0) / data.length;
  return Math.round(average * 10) / 10;
}
