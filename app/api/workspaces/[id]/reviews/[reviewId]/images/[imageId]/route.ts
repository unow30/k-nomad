/**
 * DELETE /api/workspaces/[id]/reviews/[reviewId]/images/[imageId]
 * 작업 공간 리뷰 이미지 소프트 삭제 (is_hidden = true)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createAdminClient } from "@/utils/supabase/server";

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      reviewId: string;
      imageId: string;
    }>;
  }
) {
  const { reviewId, imageId } = await params;

  try {
    // 사용자 인증 확인
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    // 관리자 여부 확인
    const currentUser = await getCurrentUser();
    const adminMode = currentUser?.role === "admin";

    // 이미지 조회
    const { data: imageData, error: fetchError } = await supabase
      .from("workspace_review_images")
      .select(
        `
        id,
        image_url,
        workspace_reviews!inner(id, user_id)
      `
      )
      .eq("id", imageId)
      .eq("workspace_reviews.id", reviewId)
      .single();

    if (fetchError || !imageData) {
      return NextResponse.json(
        { error: "이미지를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 비관리자인 경우 권한 확인 (리뷰 작성자만 삭제 가능)
    if (!adminMode) {
      const review = imageData.workspace_reviews as any;
      if (review.user_id !== user.id) {
        return NextResponse.json(
          { error: "이미지를 삭제할 권한이 없습니다" },
          { status: 403 }
        );
      }
    }

    // 관리자면 Service Role 클라이언트 (RLS 우회)
    const dbClient = adminMode ? createAdminClient() : supabase;

    // 소프트 삭제: is_hidden = true (Storage 파일 보존)
    const { error: hideError } = await dbClient
      .from("workspace_review_images")
      .update({ is_hidden: true })
      .eq("id", imageId);

    if (hideError) {
      throw hideError;
    }

    // 남은 visible 이미지 개수 확인
    const { count } = await dbClient
      .from("workspace_review_images")
      .select("id", { count: "exact" })
      .eq("review_id", reviewId)
      .eq("is_hidden", false);

    // 남은 이미지가 없으면 has_images 플래그 업데이트
    if (count === 0) {
      await dbClient
        .from("workspace_reviews")
        .update({ has_images: false })
        .eq("id", reviewId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error hiding workspace review image:", error);
    const errorMessage =
      error instanceof Error ? error.message : "이미지를 삭제할 수 없습니다";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
