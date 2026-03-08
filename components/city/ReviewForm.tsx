"use client";

import { useState } from "react";
import { Loader2, Star, PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Review } from "@/types/city";

interface ReviewFormProps {
  cityId: string;
  cityName: string;
  onSuccess?: () => void;
  onNewReview?: (review: Review) => void;
}

/**
 * 리뷰 작성 폼
 * 제목, 내용, 별점을 입력받습니다.
 */
export default function ReviewForm({ cityId, cityName, onSuccess, onNewReview }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleReset = () => {
    setTitle("");
    setContent("");
    setRating(0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    if (rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/cities/${cityId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          rating,
        }),
      });

      if (response.status === 401) {
        setShowLoginDialog(true);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "리뷰 작성 실패");
      }

      // API 응답에서 새 리뷰 데이터 받기
      const newReview: Review = await response.json();

      // 새 리뷰를 부모 컴포넌트에 전달
      onNewReview?.(newReview);

      alert("리뷰가 등록되었습니다!");
      setOpen(false);
      handleReset();
      onSuccess?.();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "리뷰 작성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg" variant="default">
        <PenLine className="w-4 h-4 mr-2" />
        리뷰 작성하기
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-2xl">
          <DialogHeader>
            <DialogTitle>{cityName}에 리뷰 작성하기</DialogTitle>
            <DialogDescription>
              당신의 경험을 다른 노마드들과 공유해주세요.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 별점 선택 */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                별점을 선택해주세요
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {rating}점
                </p>
              )}
            </div>

            {/* 제목 입력 */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                리뷰 제목
              </label>
              <Input
                placeholder="예: 좋은 날씨와 저렴한 물가가 최고!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* 내용 입력 */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                리뷰 내용
              </label>
              <Textarea
                placeholder="이 도시에서의 생활 경험을 자세히 설명해주세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
                rows={5}
              />
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  handleReset();
                  setOpen(false);
                }}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    작성 중...
                  </>
                ) : (
                  <>
                    <PenLine className="w-4 h-4 mr-2" />
                    리뷰 제출하기
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 로그인 필요 다이얼로그 */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>로그인이 필요합니다</DialogTitle>
            <DialogDescription>
              {cityName} 도시에 리뷰를 남기려면 로그인해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLoginDialog(false)}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={() => (window.location.href = "/login")}
            >
              로그인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
