/**
 * GET /api/cities/[slug]
 * 도시 상세 정보 조회
 */

import { NextRequest, NextResponse } from "next/server";
import { getCityBySlug } from "@/lib/queries/cities";
import { getCityReviews } from "@/lib/queries/user-reviews";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const supabase = await createClient();

    const city = await getCityBySlug(supabase, slug);

    // 최근 리뷰 조회
    const reviews = await getCityReviews(supabase, city.id, 5);

    // 사용자 인증 정보 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return NextResponse.json({
      city,
      reviews,
      user_id: user?.id || null,
    });
  } catch (error) {
    console.error("Error fetching city:", error);
    return NextResponse.json(
      { error: "도시 정보를 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}
