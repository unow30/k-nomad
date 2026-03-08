import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { WorkspaceReview } from "@/types/workspace";

// ============================
// 작업 공간 리뷰 함수
// ============================

/**
 * 작업 공간 리뷰 목록 조회
 */
export async function getWorkspaceReviews(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  limit = 10
): Promise<WorkspaceReview[]> {
  const { data, error } = await supabase
    .from("workspace_reviews")
    .select(
      `
      id,
      title,
      content,
      rating,
      visited_at,
      is_recommended,
      has_images,
      created_at,
      updated_at,
      user_id,
      workspace_review_images (
        id,
        image_url,
        caption,
        display_order,
        is_hidden
      )
    `
    )
    .eq("workspace_id", workspaceId)
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data || []).map((review: any) => {
    const images = (review.workspace_review_images || [])
      .filter((img: any) => !img.is_hidden)
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((img: any) => ({
        id: img.id,
        image_url: img.image_url,
        caption: img.caption ?? null,
        display_order: img.display_order,
      }));

    return {
      id: review.id,
      workspaceId: workspaceId,
      userId: review.user_id,
      title: review.title,
      content: review.content,
      rating: review.rating,
      visitedAt: review.visited_at,
      isRecommended: review.is_recommended ?? true,
      has_images: review.has_images ?? false,
      images,
      author: {
        username: "익명",
      },
      createdAt: review.created_at,
      updatedAt: review.updated_at,
    };
  });
}

/**
 * 작업 공간 리뷰 작성
 */
export async function createWorkspaceReview(
  supabaseClient: SupabaseClient<Database>,
  workspaceId: string,
  userId: string,
  {
    title,
    content,
    rating,
    visitedAt,
    isRecommended,
  }: {
    title: string;
    content: string;
    rating: number;
    visitedAt?: string;
    isRecommended?: boolean;
  }
): Promise<WorkspaceReview> {
  const { data, error } = await supabaseClient
    .from("workspace_reviews")
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      title,
      content,
      rating,
      visited_at: visitedAt,
      is_recommended: isRecommended ?? true,
    })
    .select(
      `
      id,
      title,
      content,
      rating,
      visited_at,
      is_recommended,
      created_at,
      updated_at,
      user_id
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to create workspace review: ${error.message}`);
  }

  return {
    id: data.id,
    workspaceId: workspaceId,
    userId: data.user_id,
    title: data.title,
    content: data.content,
    rating: data.rating,
    visitedAt: data.visited_at ?? undefined,
    isRecommended: data.is_recommended ?? true,
    author: {
      username: "익명",
    },
    createdAt: data.created_at!,
    updatedAt: data.updated_at!,
  };
}

/**
 * 작업 공간 리뷰 수정
 */
export async function updateWorkspaceReview(
  supabaseClient: SupabaseClient<Database>,
  reviewId: string,
  userId: string,
  {
    title,
    content,
    rating,
    visitedAt,
    isRecommended,
  }: {
    title: string;
    content: string;
    rating: number;
    visitedAt?: string;
    isRecommended?: boolean;
  },
  bypassUserCheck = false
) {
  let query = supabaseClient
    .from("workspace_reviews")
    .update({
      title,
      content,
      rating,
      visited_at: visitedAt,
      is_recommended: isRecommended,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (!bypassUserCheck) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.select().single();

  if (error) {
    throw new Error(`Failed to update workspace review: ${error.message}`);
  }

  return data;
}

/**
 * 작업 공간 리뷰 삭제
 */
export async function deleteWorkspaceReview(
  supabaseClient: SupabaseClient<Database>,
  reviewId: string,
  userId: string,
  bypassUserCheck = false
) {
  let query = supabaseClient
    .from("workspace_reviews")
    .delete()
    .eq("id", reviewId);

  if (!bypassUserCheck) {
    query = query.eq("user_id", userId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(`Failed to delete workspace review: ${error.message}`);
  }
}
