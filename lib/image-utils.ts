const sharp = require('sharp');

/**
 * 이미지 업로드 검증 및 처리 유틸리티
 * 파일 형식, 크기, 치수 등을 검증하고, 최적화
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface ImageOptimizationResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

// 허용된 MIME 타입
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

// 파일 크기 제한 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 이미지 최대 크기
const MAX_WIDTH = 2000;
const THUMBNAIL_WIDTH = 300;
const COMPRESSION_QUALITY = 80;

/**
 * 파일 검증
 * @param file - File 객체 (클라이언트) 또는 Buffer + name (서버)
 * @returns 검증 결과
 */
export async function validateImage(
  file: File | { buffer: Buffer; name: string; type: string }
): Promise<ImageValidationResult> {
  try {
    let mimeType: string;
    let size: number;
    let fileName: string;

    if (file instanceof File) {
      mimeType = file.type;
      size = file.size;
      fileName = file.name;
    } else {
      mimeType = file.type;
      size = file.buffer.length;
      fileName = file.name;
    }

    // MIME 타입 검증
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        valid: false,
        error: `지원하지 않는 파일 형식입니다. (지원: PNG, JPEG, WebP)`,
      };
    }

    // 파일 확장자 검증
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: '파일 확장자가 올바르지 않습니다.',
      };
    }

    // 파일 크기 검증
    if (size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `파일 크기가 너무 큽니다. (최대 5MB, 현재 ${(size / 1024 / 1024).toFixed(2)}MB)`,
      };
    }

    // 파일 크기가 0이 아닌지 확인
    if (size === 0) {
      return {
        valid: false,
        error: '빈 파일입니다.',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `파일 검증 중 오류가 발생했습니다.`,
    };
  }
}

/**
 * 이미지 리사이징
 * @param imageBuffer - 이미지 버퍼
 * @param maxWidth - 최대 너비 (기본값: 2000px)
 * @returns 리사이징된 이미지 정보
 */
export async function resizeImage(
  imageBuffer: Buffer,
  maxWidth: number = MAX_WIDTH
): Promise<ImageOptimizationResult> {
  try {
    const metadata = await sharp(imageBuffer).metadata();

    // 원본 크기가 maxWidth보다 작으면 리사이징 안 함
    if (!metadata.width || metadata.width <= maxWidth) {
      return {
        buffer: imageBuffer,
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: imageBuffer.length,
      };
    }

    // 리사이징
    const resized = await sharp(imageBuffer)
      .resize(maxWidth, undefined, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: resized.data,
      width: resized.info.width,
      height: resized.info.height,
      format: resized.info.format || 'unknown',
      size: resized.data.length,
    };
  } catch (error) {
    throw new Error(`이미지 리사이징 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 이미지 압축
 * @param imageBuffer - 이미지 버퍼
 * @param quality - 압축 품질 (1-100, 기본값: 80)
 * @returns 압축된 이미지 정보
 */
export async function compressImage(
  imageBuffer: Buffer,
  quality: number = COMPRESSION_QUALITY
): Promise<ImageOptimizationResult> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const format = metadata.format || 'jpeg';

    let compressed;

    if (format === 'png') {
      // PNG는 압축 품질 설정이 다름
      compressed = await sharp(imageBuffer)
        .png({ quality, progressive: true })
        .toBuffer({ resolveWithObject: true });
    } else if (format === 'webp') {
      compressed = await sharp(imageBuffer)
        .webp({ quality })
        .toBuffer({ resolveWithObject: true });
    } else {
      // JPEG
      compressed = await sharp(imageBuffer)
        .jpeg({ quality, progressive: true })
        .toBuffer({ resolveWithObject: true });
    }

    return {
      buffer: compressed.data,
      width: compressed.info.width,
      height: compressed.info.height,
      format: compressed.info.format || format,
      size: compressed.data.length,
    };
  } catch (error) {
    throw new Error(`이미지 압축 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 썸네일 생성
 * @param imageBuffer - 이미지 버퍼
 * @param width - 썸네일 너비 (기본값: 300px)
 * @returns 썸네일 정보
 */
export async function generateThumbnail(
  imageBuffer: Buffer,
  width: number = THUMBNAIL_WIDTH
): Promise<ImageOptimizationResult> {
  try {
    const thumbnail = await sharp(imageBuffer)
      .resize(width, width, {
        fit: 'cover',
        position: 'center',
      })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: thumbnail.data,
      width: thumbnail.info.width,
      height: thumbnail.info.height,
      format: thumbnail.info.format || 'jpeg',
      size: thumbnail.data.length,
    };
  } catch (error) {
    throw new Error(`썸네일 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 이미지 최적화 파이프라인
 * 리사이징 + 압축을 순차적으로 처리
 * @param imageBuffer - 이미지 버퍼
 * @param maxWidth - 최대 너비
 * @param quality - 압축 품질
 * @returns 최적화된 이미지 정보
 */
export async function optimizeImage(
  imageBuffer: Buffer,
  maxWidth: number = MAX_WIDTH,
  quality: number = COMPRESSION_QUALITY
): Promise<ImageOptimizationResult> {
  try {
    // 1단계: 리사이징
    const resized = await resizeImage(imageBuffer, maxWidth);

    // 2단계: 압축
    const compressed = await compressImage(resized.buffer, quality);

    return compressed;
  } catch (error) {
    throw new Error(`이미지 최적화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 이미지 메타데이터 추출
 * @param imageBuffer - 이미지 버퍼
 * @returns 메타데이터
 */
export async function getImageMetadata(imageBuffer: Buffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      space: metadata.space,
      hasAlpha: metadata.hasAlpha,
      size: imageBuffer.length,
    };
  } catch (error) {
    throw new Error(`메타데이터 추출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}
