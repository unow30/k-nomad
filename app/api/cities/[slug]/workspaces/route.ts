/**
 * GET /api/cities/[slug]/workspaces
 * 도시별 작업 공간 목록 조회 (필터/정렬 지원)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCityBySlug } from "@/lib/queries/cities";
import { getWorkspacesByCity } from "@/lib/queries/workspaces";
import { WorkspaceTypeEnum, PriceRangeType } from "@/types/workspace";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const supabase = await createClient();

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

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as WorkspaceTypeEnum | null;
    const priceRange = searchParams.get("priceRange") as PriceRangeType | null;
    const sort = searchParams.get("sort") || "rating";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // 작업 공간 목록 조회
    const result = await getWorkspacesByCity(supabase, city.id, {
      type: type || undefined,
      priceRange: priceRange || undefined,
      sort,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    const errorMessage =
      error instanceof Error ? error.message : "작업 공간 목록을 가져올 수 없습니다";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
