"use client";

import { useState, useEffect, useRef } from "react";
import { Star, Loader2, Calendar, X, GripVertical } from "lucide-react";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ImageUploadInput, { type ImageFile } from "./ImageUploadInput";

// ============================
// 타입 정의
// ============================

type ExistingEditableImage = {
  type: "existing";
  id: string;
  image_url: string;
  caption?: string | null;
  display_order: number;
};

type NewEditableImage = {
  type: "new";
  tempId: string;
  file: File;
  preview: string;
  caption: string;
};

type EditableImage = ExistingEditableImage | NewEditableImage;

function getItemId(item: EditableImage) {
  return item.type === "existing" ? item.id : (item as NewEditableImage).tempId;
}

// ============================
// SortableImageItem 서브컴포넌트
// ============================

function SortableImageItem({
  item,
  onHide,
  onRemove,
  onCaptionChange,
}: {
  item: EditableImage;
  onHide: (id: string) => void;
  onRemove: (tempId: string) => void;
  onCaptionChange: (tempId: string, caption: string) => void;
}) {
  const id = getItemId(item);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isExisting = item.type === "existing";
  const imageUrl = isExisting
    ? (item as ExistingEditableImage).image_url
    : (item as NewEditableImage).preview;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 border rounded-lg p-2 bg-background"
    >
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground flex-shrink-0"
        title="드래그하여 순서 변경"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* 이미지 미리보기 */}
      <div className="flex-shrink-0">
        <img
          src={imageUrl}
          alt={isExisting ? "기존 이미지" : "새 이미지"}
          className="w-16 h-16 object-cover rounded"
        />
      </div>

      {/* 캡션 / 정보 */}
      <div className="flex-1 min-w-0">
        {isExisting ? (
          <p className="text-xs text-muted-foreground truncate">
            {(item as ExistingEditableImage).caption || "기존 사진"}
          </p>
        ) : (
          <Input
            value={(item as NewEditableImage).caption}
            onChange={(e) =>
              onCaptionChange(
                (item as NewEditableImage).tempId,
                e.target.value
              )
            }
            placeholder="사진 설명 (선택)"
            className="text-sm h-8"
          />
        )}
      </div>

      {/* 숨기기 / 제거 버튼 */}
      <button
        type="button"
        onClick={() =>
          isExisting
            ? onHide((item as ExistingEditableImage).id)
            : onRemove((item as NewEditableImage).tempId)
        }
        className="flex-shrink-0 text-destructive hover:text-destructive/80 transition-colors"
        title={isExisting ? "이미지 숨기기" : "이미지 제거"}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================
// Props 인터페이스
// ============================

interface WorkspaceReviewEditFormProps {
  workspaceId: string;
  workspaceName: string;
  reviewId: string;
  initialData: {
    title: string;
    content: string;
    rating: number;
    visitedAt?: string;
    isRecommended?: boolean;
    images?: {
      id: string;
      image_url: string;
      caption?: string | null;
      display_order: number;
    }[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * 작업 공간 리뷰 수정 폼
 * dnd-kit 기반 이미지 순서 변경 + 소프트 삭제 지원
 */
export default function WorkspaceReviewEditForm({
  workspaceId,
  workspaceName,
  reviewId,
  initialData,
  open,
  onOpenChange,
  onSuccess,
}: WorkspaceReviewEditFormProps) {
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [rating, setRating] = useState(initialData.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [visitedAt, setVisitedAt] = useState(initialData.visitedAt || "");
  const [isRecommended, setIsRecommended] = useState(
    initialData.isRecommended ?? true
  );
  const [isLoading, setIsLoading] = useState(false);

  // 통합 이미지 목록 (기존 + 새 이미지, 순서 변경 가능)
  const [orderedImages, setOrderedImages] = useState<EditableImage[]>([]);
  // 숨길 기존 이미지 ID 목록
  const [imagesToHide, setImagesToHide] = useState<string[]>([]);
  // ImageUploadInput에서 관리하는 파일 목록 (diff 용)
  const prevNewImagesRef = useRef<ImageFile[]>([]);
  // ImageUploadInput 리셋 키
  const [imageUploadKey, setImageUploadKey] = useState(0);

  // dnd-kit 센서
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (open) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setRating(initialData.rating);
      setVisitedAt(initialData.visitedAt || "");
      setIsRecommended(initialData.isRecommended ?? true);

      const initial: EditableImage[] = (initialData.images || []).map(
        (img) => ({
          type: "existing" as const,
          id: img.id,
          image_url: img.image_url,
          caption: img.caption,
          display_order: img.display_order,
        })
      );
      setOrderedImages(initial);
      setImagesToHide([]);
      prevNewImagesRef.current = [];
      setImageUploadKey((k) => k + 1);
    }
  }, [open, initialData]);

  // 기존 이미지 숨기기
  const handleHideExistingImage = (id: string) => {
    setOrderedImages((prev) =>
      prev.filter((img) => !(img.type === "existing" && (img as ExistingEditableImage).id === id))
    );
    setImagesToHide((prev) => [...prev, id]);
  };

  // 새 이미지 제거
  const handleRemoveNewImage = (tempId: string) => {
    setOrderedImages((prev) =>
      prev.filter((img) => !(img.type === "new" && (img as NewEditableImage).tempId === tempId))
    );
    prevNewImagesRef.current = prevNewImagesRef.current.filter(
      (f) => f.id !== tempId
    );
  };

  // ImageUploadInput에서 파일 선택 시 (diff 적용)
  const handleNewImagesSelected = (images: ImageFile[]) => {
    const prevIds = new Set(prevNewImagesRef.current.map((f) => f.id));
    const newIds = new Set(images.map((f) => f.id));

    setOrderedImages((prev) => {
      // 선택 해제된 새 이미지 제거
      const withRemovals = prev.filter(
        (img) =>
          img.type === "existing" ||
          (img.type === "new" &&
            newIds.has((img as NewEditableImage).tempId))
      );
      // 새로 추가된 이미지 append
      const added = images.filter((f) => !prevIds.has(f.id));
      const toAdd: NewEditableImage[] = added.map((f) => ({
        type: "new" as const,
        tempId: f.id,
        file: f.file,
        preview: f.preview,
        caption: "",
      }));
      return [...withRemovals, ...toAdd];
    });

    prevNewImagesRef.current = images;
  };

  // 캡션 변경
  const handleCaptionChange = (tempId: string, caption: string) => {
    setOrderedImages((prev) =>
      prev.map((img) =>
        img.type === "new" && (img as NewEditableImage).tempId === tempId
          ? { ...img, caption }
          : img
      )
    );
  };

  // 드래그 앤 드롭 완료
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrderedImages((items) => {
        const oldIndex = items.findIndex((item) => getItemId(item) === active.id);
        const newIndex = items.findIndex((item) => getItemId(item) === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

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
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("rating", rating.toString());
      if (visitedAt) {
        formData.append("visitedAt", visitedAt);
      }
      formData.append("isRecommended", isRecommended.toString());

      // 숨길 이미지 (소프트 삭제)
      if (imagesToHide.length > 0) {
        formData.append("imagesToHide", JSON.stringify(imagesToHide));
      }

      // 기존 이미지 순서 (display_order = orderedImages에서의 최종 index)
      const imageOrder = orderedImages
        .map((img, idx) =>
          img.type === "existing"
            ? { id: (img as ExistingEditableImage).id, display_order: idx }
            : null
        )
        .filter((item): item is { id: string; display_order: number } => item !== null);

      if (imageOrder.length > 0) {
        formData.append("imageOrder", JSON.stringify(imageOrder));
      }

      // 새 이미지의 최종 위치 (display_order)
      const newImagePositions = orderedImages
        .map((img, idx) => (img.type === "new" ? idx : null))
        .filter((p): p is number => p !== null);

      if (newImagePositions.length > 0) {
        formData.append("newImagePositions", JSON.stringify(newImagePositions));
      }

      // 새 이미지 파일 (orderedImages에서의 new 순서대로)
      const newImagesInOrder = orderedImages.filter(
        (img): img is NewEditableImage => img.type === "new"
      );
      newImagesInOrder.forEach((img, i) => {
        formData.append(`images[${i}]`, img.file);
      });

      const response = await fetch(
        `/api/workspaces/${workspaceId}/reviews/${reviewId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "리뷰 수정 실패");
      }

      alert("리뷰가 수정되었습니다!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "리뷰 수정에 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sortableIds = orderedImages.map(getItemId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{workspaceName} 리뷰 수정</DialogTitle>
          <DialogDescription>
            리뷰 내용과 사진을 수정하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 별점 */}
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

          {/* 제목 */}
          <div>
            <label htmlFor="edit-title" className="text-sm font-medium mb-2 block">
              제목 <span className="text-destructive">*</span>
            </label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 조용하고 WiFi가 빠른 카페입니다"
              maxLength={200}
              required
            />
          </div>

          {/* 내용 */}
          <div>
            <label htmlFor="edit-content" className="text-sm font-medium mb-2 block">
              리뷰 내용 <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="작업 환경, 분위기, 직원 친절도 등을 자유롭게 작성해주세요."
              rows={6}
              required
            />
          </div>

          {/* 방문 날짜 */}
          <div>
            <label htmlFor="edit-visitedAt" className="text-sm font-medium mb-2 block">
              방문 날짜 (선택)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="edit-visitedAt"
                type="date"
                value={visitedAt}
                onChange={(e) => setVisitedAt(e.target.value)}
                className="pl-10"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* 이미지 목록 (기존 + 새 이미지 통합, 순서 변경 가능) */}
          {orderedImages.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                사진 순서 및 관리 ({orderedImages.length}개)
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                드래그하여 순서를 변경하고, X 버튼으로 삭제할 수 있습니다.
              </p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortableIds}
                  strategy={rectSortingStrategy}
                >
                  <div className="space-y-2">
                    {orderedImages.map((item) => (
                      <SortableImageItem
                        key={getItemId(item)}
                        item={item}
                        onHide={handleHideExistingImage}
                        onRemove={handleRemoveNewImage}
                        onCaptionChange={handleCaptionChange}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* 새 이미지 추가 */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              사진 추가 (선택)
            </label>
            <ImageUploadInput
              key={imageUploadKey}
              onImagesSelected={handleNewImagesSelected}
              maxFiles={5}
              maxFileSize={5 * 1024 * 1024}
            />
          </div>

          {/* 추천 여부 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-isRecommended"
              checked={isRecommended}
              onChange={(e) => setIsRecommended(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label
              htmlFor="edit-isRecommended"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              이 작업 공간을 추천합니다
            </label>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={
                isLoading || !title.trim() || !content.trim() || rating === 0
              }
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  수정 중...
                </>
              ) : (
                "수정 완료"
              )}
            </Button>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
            >
              취소
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
