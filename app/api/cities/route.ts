/**
 * GET /api/cities
 * 도시 목록 조회 (필터/정렬 적용)
 */

import { NextRequest, NextResponse } from "next/server";
import { getCitiesList } from "@/lib/queries/cities";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const sort = searchParams.get("sort") || "score";
    const region = searchParams.get("region") || "all";
    const budget = searchParams.get("budget") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await getCitiesList(supabase, {
      sort,
      region,
      budget: budget || undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "도시 목록을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}
