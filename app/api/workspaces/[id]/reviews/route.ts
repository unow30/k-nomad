/**
 * GET /api/workspaces/[id]/reviews
 * 작업 공간 리뷰 목록 조회
 *
 * POST /api/workspaces/[id]/reviews
 * 작업 공간 리뷰 작성 (텍스트 또는 이미지 포함)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Busboy from "busboy";
import { validateImage, optimizeImage } from "@/lib/image-utils";
import { generateStoragePath } from "@/lib/utils";
import { getWorkspaceById } from "@/lib/queries/workspaces";
import { getWorkspaceReviews, createWorkspaceReview } from "@/lib/queries/workspace-reviews";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log('[API /api/workspaces/[id]/reviews GET] 요청 받음, workspace ID:', id);

  try {
    const supabase = await createClient();

    // 작업 공간 조회
    let workspace;
    try {
      workspace = await getWorkspaceById(supabase, id);
      console.log('[API] workspace 조회 성공:', workspace.name);
    } catch (error) {
      console.error(`[API] workspace 조회 실패, id: ${id}`, error);
      return NextResponse.json(
        { error: "작업 공간을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    console.log('[API] 리뷰 조회 시작, workspace.id:', workspace.id, 'limit:', limit);

    // 리뷰 목록 조회
    let reviews = await getWorkspaceReviews(supabase, workspace.id, limit);

    console.log('[API] 리뷰 조회 완료, 개수:', reviews.length);

    // 각 리뷰에 이미지 데이터 추가
    const reviewsWithImages = await Promise.all(
      reviews.map(async (review) => {
        if (!review.has_images) {
          return { ...review, images: [] };
        }

        const { data: images, error } = await supabase
          .from("workspace_review_images")
          .select("id, image_url, caption, display_order")
          .eq("review_id", review.id)
          .order("display_order", { ascending: true });

        return {
          ...review,
          images: error ? [] : images || [],
        };
      })
    );

    console.log('[API] 이미지 포함 리뷰 반환, 총:', reviewsWithImages.length);
    return NextResponse.json(reviewsWithImages);
  } catch (error) {
    console.error("Error fetching workspace reviews:", error);
    const errorMessage =
      error instanceof Error ? error.message : "리뷰 목록을 가져올 수 없습니다";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 사용자 인증 확인
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
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

    // 작업 공간 조회
    let workspace;
    try {
      workspace = await getWorkspaceById(supabase, id);
    } catch (error) {
      console.error(`Failed to find workspace with id: ${id}`, error);
      return NextResponse.json(
        { error: "작업 공간을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 콘텐츠 타입 확인
    const contentType = request.headers.get("content-type") || "";
    let title: string = "";
    let content: string = "";
    let rating: number = 0;
    let visitedAt: string | undefined;
    let isRecommended: boolean = true;
    // 파일 인덱스를 키로 사용하는 Map으로 순서 보장
    const imageFileMap: Map<number, {
      buffer: Buffer;
      name: string;
      type: string;
      caption: string;
    }> = new Map();
    const imageCaptions: Map<number, string> = new Map();

    if (contentType.includes("multipart/form-data")) {
      // multipart/form-data 파싱
      await new Promise<void>((resolve, reject) => {
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
          headers[key.toLowerCase()] = value;
        });
        const bb = Busboy({ headers });

        bb.on("field", (fieldname: string, val: string) => {
          if (fieldname === "title") title = val;
          if (fieldname === "content") content = val;
          if (fieldname === "rating") rating = parseInt(val, 10);
          if (fieldname === "visitedAt") visitedAt = val || undefined;
          if (fieldname === "isRecommended") isRecommended = val === "true";
          // 캡션은 파일보다 나중에 올 수 있으므로 Map에 저장
          if (fieldname.startsWith("captions[")) {
            const match = fieldname.match(/captions\[(\d+)\]/);
            if (match) {
              imageCaptions.set(parseInt(match[1], 10), val);
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
              const match = fieldname.match(/images\[(\d+)\]/);
              const index = match ? parseInt(match[1], 10) : imageFileMap.size;
              imageFileMap.set(index, {
                buffer: fileBuffer,
                name: info.filename,
                type: info.mimeType,
                caption: "",  // close 후 업데이트
              });
            }
          });

          file.on("error", reject);
        });

        bb.on("close", () => {
          // 모든 field 파싱 완료 후 캡션 반영
          imageCaptions.forEach((caption, index) => {
            const imgFile = imageFileMap.get(index);
            if (imgFile) imgFile.caption = caption;
          });
          resolve();
        });
        bb.on("error", reject);

        // Request body를 busboy에 전달
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

    // Map을 인덱스 순서대로 정렬된 배열로 변환
    const imageFiles = Array.from(imageFileMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([, file]) => file);

    // 최대 5개 이미지 제한
    if (imageFiles.length > 5) {
      return NextResponse.json(
        { error: "이미지는 최대 5개까지 업로드 가능합니다" },
        { status: 400 }
      );
    }

    // 리뷰 작성
    const review = await createWorkspaceReview(supabase, workspace.id, user.id, {
      title,
      content,
      rating,
      visitedAt,
      isRecommended,
    });

    // 이미지 업로드 처리
    let hasImages = false;
    if (imageFiles.length > 0) {
      // 기존 이미지 중 display_order 최댓값 조회
      const { data: lastImage } = await supabase
        .from("workspace_review_images")
        .select("display_order")
        .eq("review_id", review.id)
        .order("display_order", { ascending: false })
        .limit(1);

      const nextOrder =
        lastImage && lastImage.length > 0
          ? (lastImage[0].display_order ?? -1) + 1
          : 0;

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];

        try {
          // 이미지 검증
          const validation = await validateImage({
            buffer: file.buffer,
            name: file.name,
            type: file.type,
          });

          if (!validation.valid) {
            console.warn(`Image ${i + 1} validation failed: ${validation.error}`);
            continue;
          }

          // 이미지 최적화
          const optimized = await optimizeImage(file.buffer);

          // Supabase Storage에 업로드
          const storagePath = generateStoragePath(file.name);

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

          // 공개 URL 생성
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("workspace-review-images")
            .getPublicUrl(storagePath);

          // workspace_review_images 레코드 생성
          const { error: dbError } = await supabase
            .from("workspace_review_images")
            .insert({
              review_id: review.id,
              image_url: publicUrl,
              caption: file.caption || null,
              display_order: nextOrder + i,
              file_size: optimized.size,
              original_filename: file.name,
            });

          if (dbError) {
            console.error(`Failed to create image record for image ${i + 1}:`, dbError);
            continue;
          }

          hasImages = true;
        } catch (imageError) {
          // 개별 이미지 오류는 해당 이미지만 건너뜀 (다른 이미지 처리 계속)
          console.error(`Error processing image ${i + 1}:`, imageError);
        }
      }

      // has_images 플래그 업데이트 (트리거가 자동 처리하지만 명시적으로도 설정)
      if (hasImages) {
        await supabase
          .from("workspace_reviews")
          .update({ has_images: true })
          .eq("id", review.id);
      }
    }

    return NextResponse.json({ ...review, hasImages }, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace review:", error);
    const errorMessage =
      error instanceof Error ? error.message : "리뷰를 작성할 수 없습니다";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
