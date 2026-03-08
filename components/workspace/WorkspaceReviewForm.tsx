"use client";

import { useState } from "react";
import { Star, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ImageUploadInput, { type ImageFile } from "./ImageUploadInput";
import ImageCaptionInput from "./ImageCaptionInput";

interface WorkspaceReviewFormProps {
  workspaceId: string;
  workspaceName: string;
  onSuccess?: () => void;
}

/**
 * 작업 공간 리뷰 작성 폼
 * 제목, 내용, 평점, 방문 날짜, 추천 여부
 */
export default function WorkspaceReviewForm({
  workspaceId,
  workspaceName,
  onSuccess,
}: WorkspaceReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [visitedAt, setVisitedAt] = useState("");
  const [isRecommended, setIsRecommended] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [imageCaptions, setImageCaptions] = useState<Map<string, string>>(new Map());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // FormData로 텍스트와 이미지 모두 전송
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("rating", rating.toString());
      if (visitedAt) {
        formData.append("visitedAt", visitedAt);
      }
      formData.append("isRecommended", isRecommended.toString());

      // 이미지 및 캡션 추가
      imageFiles.forEach((imgFile, index) => {
        formData.append(`images[${index}]`, imgFile.file);
        const caption = imageCaptions.get(imgFile.id) || "";
        formData.append(`captions[${index}]`, caption);
      });

      console.log('[리뷰 작성] 요청 시작:', {
        workspaceId,
        title: title.trim(),
        rating,
        imageCount: imageFiles.length
      });

      const response = await fetch(`/api/workspaces/${workspaceId}/reviews`, {
        method: "POST",
        body: formData,
      });

      console.log('[리뷰 작성] 응답 상태:', response.status);

      if (response.status === 401) {
        console.error('[리뷰 작성] 인증 실패: 로그인 필요');
        setShowLoginDialog(true);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[리뷰 작성] 실패:', errorData);
        throw new Error(errorData.error || "리뷰 작성 실패");
      }

      const result = await response.json();
      console.log('[리뷰 작성] 성공:', result);

      alert("리뷰가 등록되었습니다!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "리뷰 작성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setRating(0);
    setVisitedAt("");
    setIsRecommended(true);
    setImageFiles([]);
    setImageCaptions(new Map());
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg" variant="default">
        ✍️ 리뷰 작성하기
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{workspaceName} 리뷰 작성</DialogTitle>
            <DialogDescription>
              방문 경험을 공유하고 다른 노마드들에게 도움을 주세요.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 별점 (필수) */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                별점 <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-1">
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
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 (필수) */}
            <div>
              <label htmlFor="title" className="text-sm font-medium mb-2 block">
                제목 <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 조용하고 WiFi가 빠른 카페입니다"
                maxLength={200}
                required
              />
            </div>

            {/* 내용 (필수) */}
            <div>
              <label htmlFor="content" className="text-sm font-medium mb-2 block">
                리뷰 내용 <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="작업 환경, 분위기, 직원 친절도 등을 자유롭게 작성해주세요."
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                최소 10자 이상 작성해주세요.
              </p>
            </div>

            {/* 방문 날짜 (선택) */}
            <div>
              <label htmlFor="visitedAt" className="text-sm font-medium mb-2 block">
                방문 날짜 (선택)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="visitedAt"
                  type="date"
                  value={visitedAt}
                  onChange={(e) => setVisitedAt(e.target.value)}
                  className="pl-10"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                사진 추가 (선택)
              </label>
              <ImageUploadInput
                onImagesSelected={(images) => {
                  setImageFiles(images);
                  // 기존 캡션 유지, 새 이미지만 빈 값으로 초기화
                  setImageCaptions((prev) => {
                    const newCaptions = new Map<string, string>();
                    images.forEach((img) => {
                      newCaptions.set(img.id, prev.get(img.id) ?? "");
                    });
                    return newCaptions;
                  });
                }}
                maxFiles={5}
                maxFileSize={5 * 1024 * 1024}
              />
            </div>

            {/* 이미지 캡션 입력 */}
            {imageFiles.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium block">
                  사진 설명 (선택)
                </label>
                {imageFiles.map((imgFile, index) => (
                  <ImageCaptionInput
                    key={imgFile.id}
                    imageFile={imgFile.file}
                    preview={imgFile.preview}
                    caption={imageCaptions.get(imgFile.id) || ""}
                    onCaptionChange={(caption) => {
                      const newCaptions = new Map(imageCaptions);
                      newCaptions.set(imgFile.id, caption);
                      setImageCaptions(newCaptions);
                    }}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* 추천 여부 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecommended"
                checked={isRecommended}
                onChange={(e) => setIsRecommended(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label
                htmlFor="isRecommended"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                이 작업 공간을 추천합니다
              </label>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading || !title.trim() || !content.trim() || rating === 0}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  "리뷰 등록"
                )}
              </Button>
              <Button type="button" onClick={() => setOpen(false)} variant="outline">
                취소
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 로그인 안내 다이얼로그 */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>로그인이 필요합니다</DialogTitle>
            <DialogDescription>
              리뷰를 작성하려면 로그인해야 합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button onClick={() => (window.location.href = "/login")} className="flex-1">
              로그인하기
            </Button>
            <Button onClick={() => setShowLoginDialog(false)} variant="outline">
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
