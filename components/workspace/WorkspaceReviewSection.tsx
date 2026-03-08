"use client";

import { useState, useEffect } from "react";
import { WorkspaceReview } from "@/types/workspace";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import WorkspaceReviewList from "./WorkspaceReviewList";
import WorkspaceReviewForm from "./WorkspaceReviewForm";

interface WorkspaceReviewSectionProps {
  reviews: WorkspaceReview[];
  workspaceId: string;
  workspaceName: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onReviewUpdate?: () => void;
}

type SortType = "latest" | "rating" | "recommended";

const REVIEWS_PER_PAGE = 5;

/**
 * 작업공간 리뷰 섹션 컴포넌트 (클라이언트)
 * 리뷰 목록 표시, 정렬, 평가/리뷰 작성 기능
 */
export default function WorkspaceReviewSection({
  reviews: initialReviews,
  workspaceId,
  workspaceName,
  currentUserId,
  isAdmin = false,
  onReviewUpdate,
}: WorkspaceReviewSectionProps) {
  const [sortBy, setSortBy] = useState<SortType>("latest");
  const [localReviews, setLocalReviews] = useState(initialReviews);
  const [currentPage, setCurrentPage] = useState(1);

  // reviews prop이 변경되면 localReviews 업데이트
  useEffect(() => {
    setLocalReviews(initialReviews);
    setCurrentPage(1);
  }, [initialReviews]);

  // 새 리뷰 추가 핸들러
  const handleNewReview = () => {
    if (onReviewUpdate) {
      onReviewUpdate();
    } else {
      // fallback: 페이지 새로고침
      window.location.reload();
    }
  };

  // 정렬된 리뷰 목록
  const sortedReviews = [...localReviews].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "rating":
        return b.rating - a.rating;
      case "recommended":
        if (a.isRecommended === b.isRecommended) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.isRecommended ? -1 : 1;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE);
  const pagedReviews = sortedReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  const handleSortChange = (sort: SortType) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // 평균 평점 계산
  const averageRating = localReviews.length > 0
    ? (localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length).toFixed(1)
    : "0.0";

  return (
    <section className="container mx-auto px-4 py-12 border-t">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">✍️ {workspaceName} 리뷰</h2>
          {localReviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span className="font-medium text-foreground">{averageRating}</span>
              </div>
              <span>·</span>
              <span>{localReviews.length}개의 리뷰</span>
            </div>
          )}
        </div>

        {/* 정렬 버튼 */}
        {localReviews.length > 0 && (
          <div className="flex gap-2">
            <SortButton
              active={sortBy === "latest"}
              onClick={() => handleSortChange("latest")}
            >
              최신순
            </SortButton>
            <SortButton
              active={sortBy === "rating"}
              onClick={() => handleSortChange("rating")}
            >
              평점순
            </SortButton>
            <SortButton
              active={sortBy === "recommended"}
              onClick={() => handleSortChange("recommended")}
            >
              추천순
            </SortButton>
          </div>
        )}
      </div>

      {/* 리뷰 작성 버튼 */}
      <div className="mb-6 flex justify-start">
        <WorkspaceReviewForm
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          onSuccess={handleNewReview}
        />
      </div>

      {/* 리뷰 목록 */}
      <WorkspaceReviewList
        reviews={pagedReviews}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onReviewUpdated={handleNewReview}
      />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 text-sm rounded-md transition-colors ${
                page === currentPage
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            aria-label="다음 페이지"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}

/**
 * 정렬 버튼 컴포넌트
 */
function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {children}
    </button>
  );
}
