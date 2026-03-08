/**
 * GET /api/workspaces/[id]
 * 작업공간 상세 정보 조회
 */

import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceById } from "@/lib/queries/workspaces";
import { getWorkspaceReviews } from "@/lib/queries/workspace-reviews";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();

    const workspace = await getWorkspaceById(supabase, id);

    if (!workspace) {
      return NextResponse.json(
        { error: "작업공간을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 최근 리뷰 조회
    const reviews = await getWorkspaceReviews(supabase, workspace.id, 20);

    // 사용자 인증 정보 및 관리자 여부 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isAdmin = false;
    if (user) {
      const currentUser = await getCurrentUser();
      isAdmin = currentUser?.role === "admin";
    }

    return NextResponse.json({
      workspace,
      reviews,
      user_id: user?.id || null,
      is_admin: isAdmin,
    });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json(
      { error: "작업공간 정보를 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}
