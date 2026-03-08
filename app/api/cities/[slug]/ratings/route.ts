/**
 * POST /api/cities/[slug]/ratings
 * 도시 평가 제출 또는 업데이트
 *
 * PUT /api/cities/[slug]/ratings
 * 도시 평가 수정 (대체 메서드)
 *
 * DELETE /api/cities/[slug]/ratings
 * 도시 평가 삭제
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getCityBySlug } from "@/lib/queries/cities";
import { submitRating, deleteRating } from "@/lib/queries/user-ratings";

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
    const { overall_score } = body;

    // 유효성 검사
    if (
      typeof overall_score !== "number" ||
      overall_score < 1 ||
      overall_score > 5
    ) {
      return NextResponse.json(
        { error: "평점은 1-5 사이의 숫자여야 합니다" },
        { status: 400 }
      );
    }

    // 평가 제출
    const rating = await submitRating(supabase, city.id, user.id, {
      overall_score,
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error("Error submitting rating:", error);
    const errorMessage = error instanceof Error ? error.message : "평가를 제출할 수 없습니다";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // PUT은 POST와 동일하게 처리
  return POST(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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
    const { rating_id } = body;

    if (!rating_id) {
      return NextResponse.json(
        { error: "평가 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 평가 삭제
    await deleteRating(supabase, rating_id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting rating:", error);
    return NextResponse.json(
      { error: "평가를 삭제할 수 없습니다" },
      { status: 500 }
    );
  }
}
