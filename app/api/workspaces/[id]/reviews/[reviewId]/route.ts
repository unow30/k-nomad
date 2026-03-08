/**
 * PUT /api/workspaces/[id]/reviews/[reviewId]
 * 작업 공간 리뷰 수정 (이미지 추가/소프트삭제/순서변경 지원)
 *
 * DELETE /api/workspaces/[id]/reviews/[reviewId]
 * 작업 공간 리뷰 삭제 (관리자 권한 우회 지원)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Busboy from "busboy";
import { validateImage, optimizeImage } from "@/lib/image-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createAdminClient } from "@/utils/supabase/server";
import { updateWorkspaceReview, deleteWorkspaceReview } from "@/lib/queries/workspace-reviews";

function createSupabaseServerClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
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
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  const { id: workspaceId, reviewId } = await params;

  try {
    // 사용자 인증 확인
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

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

    // 비관리자인 경우 리뷰 소유자 확인
    if (!adminMode) {
      const { data: review } = await supabase
        .from("workspace_reviews")
        .select("user_id")
        .eq("id", reviewId)
        .single();
      if (!review || review.user_id !== user.id) {
        return NextResponse.json(
          { error: "수정 권한이 없습니다" },
          { status: 403 }
        );
      }
    }

    // 관리자면 Service Role 클라이언트 (RLS 우회)
    const dbClient = adminMode ? createAdminClient() : supabase;

    // 콘텐츠 타입 확인
    const contentType = request.headers.get("content-type") || "";
    let title: string = "";
    let content: string = "";
    let rating: number = 0;
    let visitedAt: string | undefined;
    let isRecommended: boolean = true;
    let imagesToHide: string[] = [];
    let imageOrder: Array<{ id: string; display_order: number }> = [];
    let newImagePositions: number[] = [];
    const newImageFiles: Array<{
      buffer: Buffer;
      name: string;
      type: string;
    }> = [];

    if (contentType.includes("multipart/form-data")) {
      // multipart/form-data 파싱
      await new Promise<void>((resolve, reject) => {
        const bb = Busboy({ headers: Object.fromEntries(request.headers.entries()) });

        bb.on("field", (fieldname: string, val: string) => {
          if (fieldname === "title") title = val;
          if (fieldname === "content") content = val;
          if (fieldname === "rating") rating = parseInt(val, 10);
          if (fieldname === "visitedAt") visitedAt = val || undefined;
          if (fieldname === "isRecommended") isRecommended = val === "true";
          if (fieldname === "imagesToHide") {
            try {
              imagesToHide = JSON.parse(val);
            } catch {
              imagesToHide = val ? [val] : [];
            }
          }
          if (fieldname === "imageOrder") {
            try {
              imageOrder = JSON.parse(val);
            } catch {
              imageOrder = [];
            }
          }
          if (fieldname === "newImagePositions") {
            try {
              newImagePositions = JSON.parse(val);
            } catch {
              newImagePositions = [];
            }
          }
          // 하위 호환: 구 버전 imagesToDelete 처리
          if (fieldname === "imagesToDelete") {
            try {
              imagesToHide = JSON.parse(val);
            } catch {
              imagesToHide = val ? [val] : [];
            }
          }
        });

        bb.on("file", (fieldname: string, file: any, info: any) => {
          const chunks: Buffer[] = [];

          file.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
          });

          file.on("end", () => {
            const fileBuffer = Buffer.concat(chunks);
            if (fieldname.startsWith("images")) {
              newImageFiles.push({
                buffer: fileBuffer,
                name: info.filename,
                type: info.mimeType,
              });
            }
          });

          file.on("error", reject);
        });

        bb.on("close", resolve);
        bb.on("error", reject);

        const reader = (request.body as ReadableStream)?.getReader();
        if (reader) {
          const pump = async () => {
            try {
              const { done, value } = await reader.read();
              if (done) {
                bb.end();
                return;
              }
              bb.write(Buffer.from(value));
              await pump();
            } catch (err) {
              reject(err);
            }
          };
          pump();
        } else {
          bb.end();
        }
      });
    } else {
      // JSON 파싱 (기존 방식)
      const body = await request.json();
      title = body.title;
      content = body.content;
      rating = body.rating;
      visitedAt = body.visitedAt;
      isRecommended = body.isRecommended;
      imagesToHide = body.imagesToHide || body.imagesToDelete || [];
      imageOrder = body.imageOrder || [];
      newImagePositions = body.newImagePositions || [];
    }

    // 유효성 검사
    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 내용은 필수입니다" },
        { status: 400 }
      );
    }

    if (
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: "평점은 1-5 사이의 숫자여야 합니다" },
        { status: 400 }
      );
    }

    // 최대 5개 이미지 제한 (visible 이미지 기준)
    const existingImagesCount = await dbClient
      .from("workspace_review_images")
      .select("id", { count: "exact" })
      .eq("review_id", reviewId)
      .eq("is_hidden", false);

    const totalImages =
      (existingImagesCount.count || 0) -
      imagesToHide.length +
      newImageFiles.length;

    if (totalImages > 5) {
      return NextResponse.json(
        { error: "이미지는 최대 5개까지 업로드 가능합니다" },
        { status: 400 }
      );
    }

    // 소프트 삭제: imagesToHide → is_hidden = true
    if (imagesToHide.length > 0) {
      try {
        await dbClient
          .from("workspace_review_images")
          .update({ is_hidden: true })
          .in("id", imagesToHide);
      } catch (error) {
        console.error("Error hiding images:", error);
      }
    }

    // 이미지 순서 업데이트
    if (imageOrder.length > 0) {
      try {
        for (const { id, display_order } of imageOrder) {
          await dbClient
            .from("workspace_review_images")
            .update({ display_order })
            .eq("id", id);
        }
      } catch (error) {
        console.error("Error updating image order:", error);
      }
    }

    // 리뷰 수정
    const review = await updateWorkspaceReview(
      dbClient,
      reviewId,
      user.id,
      {
        title,
        content,
        rating,
        visitedAt,
        isRecommended,
      },
      adminMode
    );

    // 새 이미지 업로드
    if (newImageFiles.length > 0) {
      try {
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];

          const validation = await validateImage({
            buffer: file.buffer,
            name: file.name,
            type: file.type,
          });

          if (!validation.valid) {
            console.warn(`Image ${i + 1} validation failed: ${validation.error}`);
            continue;
          }

          const optimized = await optimizeImage(file.buffer);

          const timestamp = Date.now();
          const filename = `${timestamp}-${file.name}`;
          const storagePath = `${workspaceId}/${reviewId}/${filename}`;

          const { error: uploadError } = await supabase.storage
            .from("workspace-review-images")
            .upload(storagePath, optimized.buffer, {
              contentType: file.type,
              upsert: false,
            });

          if (uploadError) {
            console.error(`Failed to upload image ${i + 1}:`, uploadError);
            continue;
          }

          const {
            data: { publicUrl },
          } = supabase.storage
            .from("workspace-review-images")
            .getPublicUrl(storagePath);

          // newImagePositions[i] 가 있으면 해당 위치, 없으면 끝에 추가
          const displayOrder = newImagePositions[i] !== undefined
            ? newImagePositions[i]
            : 1000 + i;

          const { error: dbError } = await dbClient
            .from("workspace_review_images")
            .insert({
              review_id: reviewId,
              image_url: publicUrl,
              caption: null,
              display_order: displayOrder,
              file_size: optimized.size,
            });

          if (dbError) {
            console.error(`Failed to create image record for image ${i + 1}:`, dbError);
          }
        }

        // has_images 플래그 업데이트 (visible 이미지 기준)
        const { count: visibleCount } = await dbClient
          .from("workspace_review_images")
          .select("id", { count: "exact" })
          .eq("review_id", reviewId)
          .eq("is_hidden", false);

        await dbClient
          .from("workspace_reviews")
          .update({ has_images: (visibleCount || 0) > 0 })
          .eq("id", reviewId);
      } catch (imageError) {
        console.error("Error handling images:", imageError);
      }
    } else if (imagesToHide.length > 0) {
      // 새 이미지 없이 숨기기만 한 경우에도 has_images 업데이트
      const { count: visibleCount } = await dbClient
        .from("workspace_review_images")
        .select("id", { count: "exact" })
        .eq("review_id", reviewId)
        .eq("is_hidden", false);

      await dbClient
        .from("workspace_reviews")
        .update({ has_images: (visibleCount || 0) > 0 })
        .eq("id", reviewId);
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error updating workspace review:", error);
    const errorMessage =
      error instanceof Error ? error.message : "리뷰를 수정할 수 없습니다";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  const { reviewId } = await params;

  try {
    // 사용자 인증 확인
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

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

    // 비관리자인 경우 리뷰 소유자 확인
    if (!adminMode) {
      const { data: review } = await supabase
        .from("workspace_reviews")
        .select("user_id")
        .eq("id", reviewId)
        .single();
      if (!review || review.user_id !== user.id) {
        return NextResponse.json(
          { error: "삭제 권한이 없습니다" },
          { status: 403 }
        );
      }
    }

    // 관리자면 Service Role 클라이언트 (RLS 우회)
    const dbClient = adminMode ? createAdminClient() : supabase;

    // 리뷰 삭제
    await deleteWorkspaceReview(dbClient, reviewId, user.id, adminMode);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workspace review:", error);
    const errorMessage =
      error instanceof Error ? error.message : "리뷰를 삭제할 수 없습니다";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
