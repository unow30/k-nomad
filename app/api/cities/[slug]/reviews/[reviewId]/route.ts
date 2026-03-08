/**
 * PUT /api/cities/[slug]/reviews/[reviewId]
 * 도시 리뷰 수정
 *
 * DELETE /api/cities/[slug]/reviews/[reviewId]
 * 도시 리뷰 삭제
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { updateReview, deleteReview } from "@/lib/queries/user-reviews";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; reviewId: string }> }
) {
  const { reviewId } = await params;
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

    // 요청 데이터 파싱
    const body = await request.json();
    const { title, content, rating } = body;

    // 유효성 검사
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "리뷰 제목이 필요합니다" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "리뷰 내용이 필요합니다" },
        { status: 400 }
      );
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "평점은 1-5 사이의 숫자여야 합니다" },
        { status: 400 }
      );
    }

    // 리뷰 수정
    const review = await updateReview(supabase, reviewId, user.id, {
      title: title.trim(),
      content: content.trim(),
      rating,
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "리뷰를 수정할 수 없습니다" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; reviewId: string }> }
) {
  const { reviewId } = await params;
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

    // 리뷰 삭제
    await deleteReview(supabase, reviewId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "리뷰를 삭제할 수 없습니다" },
      { status: 500 }
    );
  }
}
