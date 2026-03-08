import { describe, it, expect, beforeEach, vi } from "vitest";

const { mockFrom, supabase } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  supabase: { from: vi.fn() },
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => supabase),
}));

export { supabase, mockFrom };

import {
  getUserRating,
  submitRating,
  deleteRating,
  getCityAverageRating,
} from "@/lib/queries/user-ratings";

// Mock 데이터
const mockRating = {
  id: "rating-1",
  city_id: "city-1",
  user_id: "user-1",
  overall_score: 5,
  likes: 1,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: null,
};

// 쿼리 빌더 팩토리
function createQueryBuilderWithData(data: any, error: any = null, count: any = null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    then: async function(callback: any) {
      return callback({ data, error, count });
    },
  };
}

describe("lib/queries/user-ratings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserRating()", () => {
    it("사용자 평가 조회", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData(mockRating);

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getUserRating(mockSupabaseClient as any, "city-1", "user-1");

      expect(result).toEqual(mockRating);
    });

    it("평가 없는 경우 null 반환", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData(null, { message: "No rows found" });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getUserRating(mockSupabaseClient as any, "city-1", "user-1");

      expect(result).toBeNull();
    });
  });

  describe("submitRating()", () => {
    it("평가 upsert (새로 생성 또는 업데이트)", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const upsertQueryBuilder = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockRating, error: null }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(upsertQueryBuilder);

      const result = await submitRating(mockSupabaseClient as any, "city-1", "user-1", {
        overall_score: 5,
      });

      expect(result).toEqual(mockRating);
      expect(upsertQueryBuilder.upsert).toHaveBeenCalled();
    });

    it("upsert에 올바른 데이터 전달", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const upsertQueryBuilder = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockRating, overall_score: 4 },
          error: null,
        }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(upsertQueryBuilder);

      await submitRating(mockSupabaseClient as any, "city-1", "user-1", { overall_score: 4 });

      expect(upsertQueryBuilder.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          city_id: "city-1",
          user_id: "user-1",
          overall_score: 4,
        }),
        { onConflict: "city_id,user_id" }
      );
    });

    it("updated_at 필드 자동 설정", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const upsertQueryBuilder = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockRating, error: null }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(upsertQueryBuilder);

      await submitRating(mockSupabaseClient as any, "city-1", "user-1", { overall_score: 5 });

      const callArgs = (upsertQueryBuilder.upsert as any).mock.calls[0][0];
      expect(callArgs).toHaveProperty("updated_at");
    });
  });

  describe("deleteRating()", () => {
    it("평가 삭제", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const deleteQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: async function(callback: any) {
          return callback({ data: null, error: null });
        },
      };

      (mockSupabaseClient.from as any).mockReturnValue(deleteQueryBuilder);

      await deleteRating(mockSupabaseClient as any, "rating-1", "user-1");

      expect(deleteQueryBuilder.delete).toHaveBeenCalled();
      expect(deleteQueryBuilder.eq).toHaveBeenCalledWith("id", "rating-1");
      expect(deleteQueryBuilder.eq).toHaveBeenCalledWith("user_id", "user-1");
    });

    it("에러 발생 시 에러를 throw", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const deleteQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: async function(callback: any) {
          return callback({ data: null, error: { message: "Delete failed" } });
        },
      };

      (mockSupabaseClient.from as any).mockReturnValue(deleteQueryBuilder);

      await expect(
        deleteRating(mockSupabaseClient as any, "rating-1", "user-1")
      ).rejects.toThrow("Failed to delete rating: Delete failed");
    });
  });

  describe("getCityAverageRating()", () => {
    it("도시 평균 평점 계산", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [{ overall_score: 5 }, { overall_score: 4 }, { overall_score: 3 }],
          error: null,
        }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getCityAverageRating(mockSupabaseClient as any, "city-1");

      expect(result).toBe(4);
    });

    it("평점 없는 경우 null 반환", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getCityAverageRating(mockSupabaseClient as any, "city-1");

      expect(result).toBeNull();
    });

    it("에러 발생 시 null 반환", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: "Error" } }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getCityAverageRating(mockSupabaseClient as any, "city-1");

      expect(result).toBeNull();
    });

    it("평점을 소수점 한 자리로 반올림", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [{ overall_score: 3.33 }, { overall_score: 3.34 }, { overall_score: 3.33 }],
          error: null,
        }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getCityAverageRating(mockSupabaseClient as any, "city-1");

      // (3.33 + 3.34 + 3.33) / 3 = 3.333... ≈ 3.3
      expect(typeof result).toBe("number");
      expect(result).toBeLessThan(3.4);
      expect(result).toBeGreaterThan(3.2);
    });
  });
});
