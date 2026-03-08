"use client";

import { useState } from "react";
import { Star, MessageCircle, User, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceReview } from "@/types/workspace";
import { cn } from "@/lib/utils";
import WorkspaceReviewEditForm from "./WorkspaceReviewEditForm";
import ImageGalleryModal from "./ImageGalleryModal";

interface WorkspaceReviewListProps {
  reviews: WorkspaceReview[];
  isLoading?: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
  onReviewUpdated?: () => void;
}

/**
 * 작업 공간 리뷰 목록 컴포넌트
 * 각 리뷰의 평점, 제목, 내용, 이미지 썸네일 표시
 * 본인 또는 관리자인 경우 수정/삭제 버튼 표시
 */
export default function WorkspaceReviewList({
  reviews,
  isLoading = false,
  currentUserId,
  isAdmin = false,
  onReviewUpdated,
}: WorkspaceReviewListProps) {
  const [editingReview, setEditingReview] = useState<WorkspaceReview | null>(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<NonNullable<WorkspaceReview["images"]>>([]);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  };

  const openEditForm = (review: WorkspaceReview) => {
    setEditingReview(review);
    setEditFormOpen(true);
  };

  const openGallery = (images: NonNullable<WorkspaceReview["images"]>, index: number) => {
    setGalleryImages(images);
    setGalleryInitialIndex(index);
    setGalleryOpen(true);
  };

  const handleDelete = async (reviewId: string, workspaceId: string) => {
    if (!confirm("리뷰를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/reviews/${reviewId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "리뷰 삭제에 실패했습니다.");
        return;
      }

      onReviewUpdated?.();
    } catch {
      alert("리뷰 삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg border-dashed">
        <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
        <p className="text-muted-foreground">아직 리뷰가 없습니다.</p>
        <p className="text-sm text-muted-foreground mt-1">첫 번째 리뷰를 작성해보세요!</p>
      </div>
    );
  }

  const canEditReview = (review: WorkspaceReview) =>
    isAdmin || review.userId === currentUserId;

  return (
    <>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* 헤더: 평점, 제목, 추천 여부, 수정/삭제 */}
            <div className="flex items-start justify-between mb-2 gap-3">
              <div className="flex-1 min-w-0">
                {/* 평점 */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < review.rating ? "fill-current" : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.rating}.0</span>
                </div>

                {/* 제목 */}
                <h4 className="font-semibold text-base line-clamp-2">{review.title}</h4>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {/* 추천 배지 */}
                {review.isRecommended && (
                  <Badge variant="secondary" className="whitespace-nowrap">
                    ✅ 추천
                  </Badge>
                )}

                {/* 수정/삭제 버튼 (본인 또는 관리자) */}
                {canEditReview(review) && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => openEditForm(review)}
                      title="리뷰 수정"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(review.id, review.workspaceId)}
                      title="리뷰 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* 작성자 정보 */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {review.author?.username || "익명"}
                </p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-muted-foreground">
                    작성: {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString("ko-KR")
                      : ""}
                  </p>
                  {review.visitedAt && (
                    <p className="text-xs text-muted-foreground">
                      방문: {new Date(review.visitedAt).toLocaleDateString("ko-KR")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 내용 */}
            <div
              className="text-sm text-muted-foreground mb-1 leading-relaxed whitespace-pre-wrap cursor-pointer"
              onClick={() => toggleExpand(review.id)}
            >
              <p className={cn(!expandedReviews.has(review.id) && "line-clamp-3")}>
                {review.content}
              </p>
              <button className="text-xs text-primary mt-1 hover:underline">
                {expandedReviews.has(review.id) ? "접기" : "더 보기"}
              </button>
            </div>

            {/* 이미지 썸네일 */}
            {review.images && review.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  사진 {review.images.length}개
                </p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                  {review.images.map((image, imgIdx) => (
                    <div
                      key={image.id}
                      className="relative rounded-lg overflow-hidden bg-muted h-20 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openGallery(review.images!, imgIdx)}
                    >
                      <img
                        src={image.image_url}
                        alt={`Review image ${imgIdx + 1}`}
                        className="w-full h-full object-cover"
                        title={image.caption || undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 이미지 갤러리 모달 */}
      <ImageGalleryModal
        images={galleryImages}
        initialIndex={galleryInitialIndex}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
      />

      {/* 수정 폼 모달 */}
      {editingReview && (
        <WorkspaceReviewEditForm
          workspaceId={editingReview.workspaceId}
          workspaceName=""
          reviewId={editingReview.id}
          initialData={{
            title: editingReview.title,
            content: editingReview.content,
            rating: editingReview.rating,
            visitedAt: editingReview.visitedAt,
            isRecommended: editingReview.isRecommended,
            images: editingReview.images,
          }}
          open={editFormOpen}
          onOpenChange={(open) => {
            setEditFormOpen(open);
            if (!open) setEditingReview(null);
          }}
          onSuccess={() => {
            setEditFormOpen(false);
            setEditingReview(null);
            onReviewUpdated?.();
          }}
        />
      )}
    </>
  );
}
