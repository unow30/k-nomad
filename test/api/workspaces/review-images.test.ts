import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateImage,
  resizeImage,
  generateThumbnail,
  compressImage,
  optimizeImage,
} from "@/lib/image-utils";

/**
 * Workspace Review Image Utils 심화 테스트
 *
 * lib/image-utils.ts의 validateImage 경계값 테스트와
 * sharp 의존 함수들의 에러 핸들링을 검증합니다.
 *
 * Note: lib/image-utils.ts가 CJS require('sharp')를 사용하므로
 * Vitest ESM mock으로 sharp를 직접 mocking하기 어렵습니다.
 * 대신 validateImage의 경계값 케이스와 에러 핸들링 동작을 검증합니다.
 */

describe("validateImage 경계값 테스트", () => {
  it("정확히 5MB 파일 통과", async () => {
    const file = {
      buffer: Buffer.alloc(5 * 1024 * 1024),
      name: "exact5mb.jpg",
      type: "image/jpeg",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("5MB + 1byte 파일 거부", async () => {
    const file = {
      buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
      name: "over5mb.jpg",
      type: "image/jpeg",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("5MB");
  });

  it("GIF MIME 타입 거부", async () => {
    const file = {
      buffer: Buffer.alloc(1024),
      name: "test.gif",
      type: "image/gif",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("PNG");
    expect(result.error).toContain("JPEG");
    expect(result.error).toContain("WebP");
  });

  it("BMP MIME 타입 거부", async () => {
    const file = {
      buffer: Buffer.alloc(1024),
      name: "test.bmp",
      type: "image/bmp",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(false);
  });

  it("확장자 없는 파일명 거부", async () => {
    const file = {
      buffer: Buffer.alloc(1024),
      name: "noextension",
      type: "image/jpeg",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("잘못된 확장자 파일 거부 (.exe)", async () => {
    const file = {
      buffer: Buffer.alloc(1024),
      name: "malicious.exe",
      type: "image/jpeg",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(false);
  });

  it("JPEG 파일(.jpg) 통과", async () => {
    const file = {
      buffer: Buffer.alloc(1024),
      name: "photo.jpg",
      type: "image/jpeg",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(true);
  });

  it("JPEG 파일(.jpeg) 통과", async () => {
    const file = {
      buffer: Buffer.alloc(1024),
      name: "photo.jpeg",
      type: "image/jpeg",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(true);
  });

  it("PNG 파일 통과", async () => {
    const file = {
      buffer: Buffer.alloc(1024),
      name: "image.png",
      type: "image/png",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(true);
  });

  it("WebP 파일 통과", async () => {
    const file = {
      buffer: Buffer.alloc(1024),
      name: "image.webp",
      type: "image/webp",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(true);
  });

  it("빈 파일(0 bytes) 거부", async () => {
    const file = {
      buffer: Buffer.alloc(0),
      name: "empty.jpg",
      type: "image/jpeg",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("MIME 타입과 확장자 불일치 - 확장자 기준으로 검증", async () => {
    // MIME 타입이 맞아도 확장자가 틀리면 거부
    const file = {
      buffer: Buffer.alloc(1024),
      name: "image.gif", // gif 확장자
      type: "image/jpeg", // jpeg MIME
    };
    const result = await validateImage(file);
    // gif 확장자는 ALLOWED_EXTENSIONS에 없으므로 거부
    expect(result.valid).toBe(false);
  });

  it("대소문자 확장자 처리 (.JPG)", async () => {
    // 확장자를 toLowerCase로 처리하는지 확인
    const file = {
      buffer: Buffer.alloc(1024),
      name: "photo.JPG",
      type: "image/jpeg",
    };
    const result = await validateImage(file);
    // 소문자 변환 후 허용되어야 함
    expect(result.valid).toBe(true);
  });

  it("에러 메시지에 현재 파일 크기 포함", async () => {
    const oversizeBuffer = Buffer.alloc(7 * 1024 * 1024); // 7MB
    const file = {
      buffer: oversizeBuffer,
      name: "large.jpg",
      type: "image/jpeg",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/\d+\.\d+MB/);
  });
});

describe("resizeImage 에러 핸들링", () => {
  it("잘못된 이미지 버퍼로 호출 시 에러 발생", async () => {
    const invalidBuffer = Buffer.alloc(1024); // 유효하지 않은 이미지
    await expect(resizeImage(invalidBuffer)).rejects.toThrow(/리사이징 실패/);
  });

  it("빈 버퍼로 호출 시 에러 발생", async () => {
    const emptyBuffer = Buffer.alloc(0);
    await expect(resizeImage(emptyBuffer)).rejects.toThrow();
  });

  it("에러 메시지에 '이미지 리사이징 실패' 포함", async () => {
    const invalidBuffer = Buffer.alloc(512);
    await expect(resizeImage(invalidBuffer)).rejects.toThrow("이미지 리사이징 실패");
  });
});

describe("generateThumbnail 에러 핸들링", () => {
  it("잘못된 이미지 버퍼로 호출 시 에러 발생", async () => {
    const invalidBuffer = Buffer.alloc(1024);
    await expect(generateThumbnail(invalidBuffer)).rejects.toThrow(/썸네일 생성 실패/);
  });

  it("빈 버퍼로 호출 시 에러 발생", async () => {
    const emptyBuffer = Buffer.alloc(0);
    await expect(generateThumbnail(emptyBuffer)).rejects.toThrow();
  });

  it("에러 메시지에 '썸네일 생성 실패' 포함", async () => {
    const invalidBuffer = Buffer.alloc(256);
    await expect(generateThumbnail(invalidBuffer)).rejects.toThrow("썸네일 생성 실패");
  });
});

describe("compressImage 에러 핸들링", () => {
  it("잘못된 이미지 버퍼로 호출 시 에러 발생", async () => {
    const invalidBuffer = Buffer.alloc(1024);
    await expect(compressImage(invalidBuffer)).rejects.toThrow(/압축 실패/);
  });

  it("빈 버퍼로 호출 시 에러 발생", async () => {
    const emptyBuffer = Buffer.alloc(0);
    await expect(compressImage(emptyBuffer)).rejects.toThrow();
  });

  it("에러 메시지에 '이미지 압축 실패' 포함", async () => {
    const invalidBuffer = Buffer.alloc(512);
    await expect(compressImage(invalidBuffer)).rejects.toThrow("이미지 압축 실패");
  });
});

describe("optimizeImage 에러 핸들링 및 파이프라인", () => {
  it("잘못된 이미지 버퍼로 호출 시 에러 발생", async () => {
    const invalidBuffer = Buffer.alloc(1024);
    await expect(optimizeImage(invalidBuffer)).rejects.toThrow(/최적화 실패/);
  });

  it("빈 버퍼로 호출 시 에러 발생", async () => {
    const emptyBuffer = Buffer.alloc(0);
    await expect(optimizeImage(emptyBuffer)).rejects.toThrow();
  });

  it("에러 메시지에 '이미지 최적화 실패' 포함", async () => {
    const invalidBuffer = Buffer.alloc(512);
    await expect(optimizeImage(invalidBuffer)).rejects.toThrow("이미지 최적화 실패");
  });

  it("리사이징 에러가 최적화 에러로 래핑됨", async () => {
    const invalidBuffer = Buffer.alloc(1024);
    let caughtError: Error | null = null;
    try {
      await optimizeImage(invalidBuffer);
    } catch (e) {
      caughtError = e as Error;
    }
    expect(caughtError).not.toBeNull();
    expect(caughtError!.message).toContain("이미지 최적화 실패");
  });
});

describe("validateImage 반환값 타입 검증", () => {
  it("유효한 파일 - valid: true, error: undefined 반환", async () => {
    const file = {
      buffer: Buffer.alloc(1024),
      name: "test.jpg",
      type: "image/jpeg",
    };
    const result = await validateImage(file);
    expect(result).toHaveProperty("valid");
    expect(result).not.toHaveProperty("error");
  });

  it("무효한 파일 - valid: false, error: string 반환", async () => {
    const file = {
      buffer: Buffer.alloc(0),
      name: "empty.jpg",
      type: "image/jpeg",
    };
    const result = await validateImage(file);
    expect(result.valid).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(result.error!.length).toBeGreaterThan(0);
  });

  it("File 객체도 유효하게 처리", async () => {
    const file = new File(
      [Buffer.alloc(1024)],
      "test.jpg",
      { type: "image/jpeg" }
    );
    const result = await validateImage(file);
    expect(result.valid).toBe(true);
  });
});
