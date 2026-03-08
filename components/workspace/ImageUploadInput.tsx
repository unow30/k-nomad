"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ImageFile {
  file: File;
  preview: string; // data URL for preview
  id: string; // temporary ID for component
}

interface ImageUploadInputProps {
  onImagesSelected: (images: ImageFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
}

/**
 * 이미지 업로드 입력 컴포넌트
 * 드래그&드롭 및 클릭 파일 선택 지원
 */
export default function ImageUploadInput({
  onImagesSelected,
  maxFiles = 5,
  maxFileSize = 5 * 1024 * 1024, // 5MB
}: ImageUploadInputProps) {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

  // 파일 검증 (Promise 기반 비동기)
  const validateFiles = async (files: File[]): Promise<{ valid: ImageFile[]; errors: string[] }> => {
    const newErrors: string[] = [];

    const promises = files.map((file) => {
      // 타입 확인
      if (!ALLOWED_TYPES.includes(file.type)) {
        newErrors.push(`${file.name}: PNG, JPEG, WebP만 지원됩니다.`);
        return Promise.resolve<ImageFile | null>(null);
      }

      // 크기 확인
      if (file.size > maxFileSize) {
        newErrors.push(
          `${file.name}: 파일 크기가 ${(maxFileSize / 1024 / 1024).toFixed(1)}MB를 초과합니다.`
        );
        return Promise.resolve<ImageFile | null>(null);
      }

      // FileReader를 Promise로 감싸서 onload 완료 후 resolve
      return new Promise<ImageFile | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          resolve({
            file,
            preview,
            id: `temp-${Date.now()}-${Math.random()}`,
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });

    const results = await Promise.all(promises);
    const valid = results.filter((r): r is ImageFile => r !== null);
    return { valid, errors: newErrors };
  };

  // 파일 처리
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);

      // 최대 파일 수 확인
      if (selectedImages.length + fileArray.length > maxFiles) {
        setErrors([
          `최대 ${maxFiles}개까지만 업로드 가능합니다. (현재 ${selectedImages.length}개)`,
        ]);
        return;
      }

      const { valid, errors } = await validateFiles(fileArray);

      if (errors.length > 0) {
        setErrors(errors);
        return;
      }

      const newImages = [...selectedImages, ...valid];
      setSelectedImages(newImages);
      onImagesSelected(newImages);
      setErrors([]);
    },
    [selectedImages, onImagesSelected, maxFiles]
  );

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  // 드래그 나감
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  // 드롭
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    await handleFiles(e.dataTransfer.files);
  };

  // 클릭 파일 선택
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 파일 선택 후 처리
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    await handleFiles(files);
    // 파일 처리 후 초기화 (같은 파일을 다시 선택 가능하도록)
    e.target.value = "";
  };

  // 이미지 제거
  const removeImage = (id: string) => {
    const newImages = selectedImages.filter((img) => img.id !== id);
    setSelectedImages(newImages);
    onImagesSelected(newImages);
  };

  return (
    <div className="space-y-4">
      {/* 드래그&드롭 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">이미지를 여기에 드래그하거나 클릭하여 선택</p>
            <p className="text-sm text-muted-foreground mt-1">
              PNG, JPEG, WebP (최대 {(maxFileSize / 1024 / 1024).toFixed(0)}MB, 최대 {maxFiles}개)
            </p>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {errors.map((error, idx) => (
                <p key={idx} className="text-sm text-destructive">
                  {error}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 미리보기 */}
      {selectedImages.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium block">
            선택된 이미지 ({selectedImages.length}/{maxFiles})
          </label>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
            {selectedImages.map((image) => (
              <div key={image.id} className="relative group">
                {/* 이미지 미리보기 */}
                <img
                  src={image.preview}
                  alt="preview"
                  className="w-full h-24 object-cover rounded-lg border border-muted-foreground/25"
                />

                {/* 파일명 */}
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {image.file.name}
                </p>

                {/* 삭제 버튼 */}
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className={cn(
                    "absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1",
                    "opacity-0 group-hover:opacity-100 transition-opacity"
                  )}
                  title="삭제"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
