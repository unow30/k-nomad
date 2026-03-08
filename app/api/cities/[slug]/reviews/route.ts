/**
 * POST /api/cities/[slug]/reviews
 * 도시 리뷰 작성
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getCityBySlug } from "@/lib/queries/cities";
import { createReview } from "@/lib/queries/user-reviews";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
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

    // 도시 조회
    let city;
    try {
      city = await getCityBySlug(supabase, slug);
    } catch (error) {
      console.error(`Failed to find city with slug: ${slug}`, error);
      return NextResponse.json(
        { error: "도시를 찾을 수 없습니다" },
        { status: 404 }
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

    // 리뷰 생성
    const review = await createReview(supabase, city.id, user.id, {
      title: title.trim(),
      content: content.trim(),
      rating,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    const errorMessage = error instanceof Error ? error.message : "리뷰를 작성할 수 없습니다";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
