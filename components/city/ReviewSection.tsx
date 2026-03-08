"use client";

import { useState } from "react";
import { Review } from "@/types/city";
import { Star, ThumbsUp, Calendar, Clock, User } from "lucide-react";
import RatingForm from "./RatingForm";
import ReviewForm from "./ReviewForm";

interface ReviewSectionProps {
  reviews: Review[];
  cityName: string;
  cityId?: string;
}

type SortType = "latest" | "rating" | "likes";

/**
 * 리뷰 섹션 컴포넌트 (클라이언트)
 * 리뷰 목록 표시 및 정렬 기능
 */
export default function ReviewSection({ reviews, cityName, cityId }: ReviewSectionProps) {
  const [sortBy, setSortBy] = useState<SortType>("latest");
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);

  // 새 리뷰 추가 핸들러
  const handleNewReview = (newReview: Review) => {
    setLocalReviews((prev) => [newReview, ...prev]);
  };

  // 정렬된 리뷰 목록
  const sortedReviews = [...localReviews].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "rating":
        return b.rating - a.rating;
      case "likes":
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  // 평균 평점 계산
  const averageRating = localReviews.length > 0
    ? (localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length).toFixed(1)
    : "0.0";

  if (localReviews.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12 border-t">
        <h2 className="text-2xl font-bold mb-6">✍️ {cityName} 리뷰</h2>
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>아직 리뷰가 없습니다.</p>
          <p className="text-sm mt-2">첫 번째 평가나 리뷰를 작성해보세요!</p>
          {cityId && (
            <div className="mt-4 flex justify-center gap-3 flex-wrap">
              <RatingForm cityId={cityId} cityName={cityName} />
              <ReviewForm cityId={cityId} cityName={cityName} onNewReview={handleNewReview} />
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12 border-t">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">✍️ {cityName} 리뷰</h2>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="font-medium text-foreground">{averageRating}</span>
            </div>
            <span>·</span>
            <span>{localReviews.length}개의 리뷰</span>
          </div>
        </div>

        {/* 정렬 버튼 */}
        <div className="flex gap-2">
          <SortButton
            active={sortBy === "latest"}
            onClick={() => setSortBy("latest")}
          >
            최신순
          </SortButton>
          <SortButton
            active={sortBy === "rating"}
            onClick={() => setSortBy("rating")}
          >
            평점순
          </SortButton>
          <SortButton
            active={sortBy === "likes"}
            onClick={() => setSortBy("likes")}
          >
            좋아요순
          </SortButton>
        </div>
      </div>

      {/* 평가/리뷰 작성 버튼 */}
      {cityId && (
        <div className="mb-6 flex justify-start gap-3 flex-wrap">
          <RatingForm cityId={cityId} cityName={cityName} />
          <ReviewForm cityId={cityId} cityName={cityName} onNewReview={handleNewReview} />
        </div>
      )}

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
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

/**
 * 리뷰 카드 컴포넌트
 */
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="p-5 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      {/* 작성자 정보 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{review.authorName}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(review.createdAt)}</span>
              </div>
              {review.stayDuration && (
                <>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{review.stayDuration} 체류</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 평점 */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating
                  ? "text-amber-500 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 리뷰 내용 */}
      <p className="text-foreground leading-relaxed">{review.content}</p>

      {/* 좋아요 */}
      <div className="mt-4 flex items-center gap-2">
        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-muted hover:bg-muted/80 transition-colors">
          <ThumbsUp className="w-4 h-4" />
          <span>도움이 됐어요</span>
          <span className="font-medium">{review.likes}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
