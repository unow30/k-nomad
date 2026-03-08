"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface RatingFormProps {
  cityId: string;
  cityName: string;
  onSuccess?: () => void;
}

/**
 * 평가 제출 폼
 * 별점(1-5)만 제출합니다.
 */
export default function RatingForm({ cityId, cityName, onSuccess }: RatingFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/cities/${cityId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overall_score: rating,
        }),
      });

      if (response.status === 401) {
        setShowLoginDialog(true);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "평가 제출 실패");
      }

      alert("평가가 등록되었습니다!");
      setOpen(false);
      setRating(0);
      onSuccess?.();
    } catch (error) {
      console.error("Error:", error);
      alert("평가 제출에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg" variant="default">
        📊 평가 작성하기
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>{cityName}에 평가하기</DialogTitle>
            <DialogDescription>
              이 도시에 대한 별점을 남겨주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 별점 선택 */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                별점을 선택해주세요
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
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
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {rating}점
                </p>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="mt-4">
              <Button
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={isLoading || rating === 0}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "평가 제출"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 로그인 필요 다이얼로그 */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>로그인이 필요합니다</DialogTitle>
            <DialogDescription>
              {cityName} 도시에 평가를 남기려면 로그인해주세요.
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
