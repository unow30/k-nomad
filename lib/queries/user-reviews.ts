import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

// ============================
// 사용자 리뷰 함수
// ============================

/**
 * 도시 리뷰 목록 조회 (Review 타입으로 변환)
 */
export async function getCityReviews(supabase: SupabaseClient<Database>, cityId: string, limit = 10) {
  const { data, error } = await supabase
    .from("user_reviews")
    .select(
      `
      id,
      title,
      content,
      rating,
      created_at,
      user_id,
      users(display_name, avatar_url)
    `
    )
    .eq("city_id", cityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  // Review 타입으로 변환
  return (data || []).map((review: any) => ({
    id: review.id,
    authorName: review.users?.display_name || "익명",
    authorImage: review.users?.avatar_url,
    rating: review.rating,
    content: review.content,
    createdAt: review.created_at,
    likes: 0, // API에서 구현되지 않은 부분
  }));
}

/**
 * 리뷰 작성 (Review 타입으로 변환하여 반환)
 */
export async function createReview(
  supabaseClient: SupabaseClient<Database>,
  cityId: string,
  userId: string,
  { title, content, rating }: { title: string; content: string; rating: number }
) {
  const { data, error } = await supabaseClient
    .from("user_reviews")
    .insert({
      city_id: cityId,
      user_id: userId,
      title,
      content,
      rating,
    })
    .select(
      `
      id,
      title,
      content,
      rating,
      created_at,
      user_id,
      users(display_name, avatar_url)
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to create review: ${error.message}`);
  }

  // Review 타입으로 변환하여 반환
  return {
    id: data.id,
    authorName: (data.users as any)?.display_name || "익명",
    authorImage: (data.users as any)?.avatar_url,
    rating: data.rating,
    content: data.content,
    createdAt: data.created_at,
    likes: 0,
  };
}

/**
 * 리뷰 수정
 */
export async function updateReview(
  supabaseClient: SupabaseClient<Database>,
  reviewId: string,
  userId: string,
  { title, content, rating }: { title: string; content: string; rating: number }
) {
  const { data, error } = await supabaseClient
    .from("user_reviews")
    .update({ title, content, rating, updated_at: new Date().toISOString() })
    .eq("id", reviewId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update review: ${error.message}`);
  }

  return data;
}

/**
 * 리뷰 삭제
 */
export async function deleteReview(supabaseClient: SupabaseClient<Database>, reviewId: string, userId: string) {
  const { error } = await supabaseClient
    .from("user_reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete review: ${error.message}`);
  }
}
