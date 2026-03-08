/**
 * GET /api/cities/[slug]/metrics
 * 도시 실시간 메트릭 조회
 */

import { NextRequest, NextResponse } from "next/server";
import { getCityBySlug, getCityMetrics } from "@/lib/queries/cities";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const supabase = await createClient();

    const city = await getCityBySlug(supabase, slug);
    const metrics = await getCityMetrics(supabase, city.id);

    if (!metrics) {
      return NextResponse.json(
        { error: "메트릭 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching city metrics:", error);
    return NextResponse.json(
      { error: "메트릭 정보를 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}
