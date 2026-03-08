"use client";

import { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTitle } from "@/components/ui/dialog";

interface ReviewImage {
  id: string;
  image_url: string;
  caption?: string | null;
  display_order: number;
}

interface ImageGalleryModalProps {
  images: ReviewImage[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImageGalleryModal({
  images,
  initialIndex,
  open,
  onOpenChange,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, images.length]);

  const currentImage = images[currentIndex];
  const showNavigation = images.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] bg-black/95 rounded-lg overflow-hidden duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <DialogTitle className="sr-only">이미지 갤러리</DialogTitle>

          {/* 닫기 버튼 */}
          <DialogClose className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors">
            <X className="h-5 w-5" />
            <span className="sr-only">닫기</span>
          </DialogClose>

          {/* 이미지 영역 */}
          <div className="relative w-full aspect-[4/3]">
            {currentImage && (
              <Image
                src={currentImage.image_url}
                alt={currentImage.caption || `이미지 ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            )}

            {/* 이전 버튼 */}
            {showNavigation && currentIndex > 0 && (
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                aria-label="이전 이미지"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* 다음 버튼 */}
            {showNavigation && currentIndex < images.length - 1 && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                aria-label="다음 이미지"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* 하단 영역: 캡션 + 카운터 */}
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-white/80 flex-1">
              {currentImage?.caption || ""}
            </p>
            {showNavigation && (
              <span className="text-sm text-white/60 flex-shrink-0 ml-4">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
