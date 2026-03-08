"use client";

import { Textarea } from "@/components/ui/textarea";

interface ImageCaptionInputProps {
  imageFile: File;
  preview: string;
  caption: string;
  onCaptionChange: (caption: string) => void;
  index: number;
}

const MAX_CAPTION_LENGTH = 500;

/**
 * 이미지 캡션 입력 컴포넌트
 * 각 이미지에 대한 설명 추가
 */
export default function ImageCaptionInput({
  imageFile,
  preview,
  caption,
  onCaptionChange,
  index,
}: ImageCaptionInputProps) {
  return (
    <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
      <div className="flex gap-4">
        {/* 이미지 미리보기 */}
        <div className="flex-shrink-0">
          <img
            src={preview}
            alt={`Preview ${index + 1}`}
            className="w-20 h-20 object-cover rounded-lg border border-muted-foreground/25"
          />
        </div>

        {/* 이미지 정보 및 캡션 입력 */}
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-sm font-medium">이미지 {index + 1}</p>
            <p className="text-xs text-muted-foreground truncate">{imageFile.name}</p>
          </div>

          {/* 캡션 입력 */}
          <div className="space-y-1">
            <label htmlFor={`caption-${index}`} className="text-xs font-medium">
              캡션 (선택)
            </label>
            <Textarea
              id={`caption-${index}`}
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="예: 카페 외부 전경, 작업 공간 모습, WiFi 속도 표시 등"
              maxLength={MAX_CAPTION_LENGTH}
              rows={2}
              className="resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground text-right">
              {caption.length}/{MAX_CAPTION_LENGTH}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
