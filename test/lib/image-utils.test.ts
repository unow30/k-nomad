import { describe, it, expect, beforeEach } from "vitest";
import { validateImage, optimizeImage, getImageMetadata } from "@/lib/image-utils";

describe("Image Utils", () => {
  describe("validateImage", () => {
    it("should validate correct image file", async () => {
      const mockFile = {
        buffer: Buffer.alloc(1024 * 100), // 100KB
        name: "test.jpg",
        type: "image/jpeg",
      };

      const result = await validateImage(mockFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject unsupported file type", async () => {
      const mockFile = {
        buffer: Buffer.alloc(1024),
        name: "test.exe",
        type: "application/x-msdownload",
      };

      const result = await validateImage(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject file exceeding size limit", async () => {
      const mockFile = {
        buffer: Buffer.alloc(10 * 1024 * 1024), // 10MB
        name: "large.jpg",
        type: "image/jpeg",
      };

      const result = await validateImage(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("5MB");
    });

    it("should reject empty files", async () => {
      const mockFile = {
        buffer: Buffer.alloc(0),
        name: "empty.jpg",
        type: "image/jpeg",
      };

      const result = await validateImage(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should accept PNG, JPEG, and WebP formats", async () => {
      const formats = [
        { type: "image/png", name: "test.png" },
        { type: "image/jpeg", name: "test.jpg" },
        { type: "image/webp", name: "test.webp" },
      ];

      for (const format of formats) {
        const mockFile = {
          buffer: Buffer.alloc(1024),
          name: format.name,
          type: format.type,
        };

        const result = await validateImage(mockFile);
        expect(result.valid).toBe(true);
      }
    });
  });

  describe("optimizeImage", () => {
    it("should reject invalid image data", async () => {
      // Mock buffer without valid image data should fail
      const invalidBuffer = Buffer.alloc(1024 * 200);
      await expect(optimizeImage(invalidBuffer)).rejects.toThrow();
    });

    it("should handle empty buffer gracefully", async () => {
      const emptyBuffer = Buffer.alloc(0);
      await expect(optimizeImage(emptyBuffer)).rejects.toThrow();
    });

    it("should handle unsupported formats", async () => {
      // Random data that isn't a valid image
      const randomBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG header but incomplete
      // This should also fail as it's not complete image data
      await expect(optimizeImage(randomBuffer)).rejects.toThrow();
    });
  });

  describe("getImageMetadata", () => {
    it("should reject invalid image buffer", async () => {
      // Mock buffer without valid image data
      const invalidBuffer = Buffer.alloc(1024 * 100);
      await expect(getImageMetadata(invalidBuffer)).rejects.toThrow();
    });

    it("should handle empty buffer", async () => {
      const emptyBuffer = Buffer.alloc(0);
      await expect(getImageMetadata(emptyBuffer)).rejects.toThrow();
    });
  });
});
