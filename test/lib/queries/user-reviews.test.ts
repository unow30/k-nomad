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
  getCityReviews,
  createReview,
  updateReview,
  deleteReview,
} from "@/lib/queries/user-reviews";

// createReview가 반환하는 형식 (Review 타입)
const mockReviewResponse = {
  id: "review-1",
  authorName: "홍길동",
  authorImage: "https://example.com/avatar.jpg",
  rating: 5,
  content: "정말 좋은 도시입니다",
  createdAt: "2024-01-01T00:00:00Z",
  likes: 0,
};

// 데이터베이스에서 반환되는 원시 형식
const mockReviewRaw = {
  id: "review-1",
  title: "좋은 도시",
  content: "정말 좋은 도시입니다",
  rating: 5,
  created_at: "2024-01-01T00:00:00Z",
  user_id: "user-1",
  users: {
    display_name: "홍길동",
    avatar_url: "https://example.com/avatar.jpg",
  },
};

describe("lib/queries/user-reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCityReviews()", () => {
    it("도시 리뷰 목록 조회", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [mockReviewRaw],
          error: null,
        }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getCityReviews(mockSupabaseClient as any, "city-1");

      expect(result).toHaveLength(1);
      expect(result[0].authorName).toBe("홍길동");
      expect(result[0].rating).toBe(5);
    });

    it("빈 리뷰 목록 반환", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getCityReviews(mockSupabaseClient as any, "city-1");

      expect(result).toEqual([]);
    });

    it("에러 발생 시 빈 배열 반환", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: { message: "Error" } }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getCityReviews(mockSupabaseClient as any, "city-1");

      expect(result).toEqual([]);
    });

    it("리뷰 limit 적용", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [mockReviewRaw], error: null }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getCityReviews(mockSupabaseClient as any, "city-1", 20);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(20);
    });

    it("익명 사용자 처리", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const reviewWithoutUser = { ...mockReviewRaw, users: null };

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [reviewWithoutUser], error: null }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getCityReviews(mockSupabaseClient as any, "city-1");

      expect(result[0].authorName).toBe("익명");
    });
  });

  describe("createReview()", () => {
    it("리뷰 생성", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const insertQueryBuilder = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockReviewRaw, error: null }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(insertQueryBuilder);

      const result = await createReview(
        mockSupabaseClient as any,
        "city-1",
        "user-1",
        { title: "좋은 도시", content: "정말 좋은 도시입니다", rating: 5 }
      );

      expect(insertQueryBuilder.insert).toHaveBeenCalledWith({
        city_id: "city-1",
        user_id: "user-1",
        title: "좋은 도시",
        content: "정말 좋은 도시입니다",
        rating: 5,
      });
      expect(result).toEqual(mockReviewResponse);
    });

    it("리뷰 생성 실패 시 에러", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const insertQueryBuilder = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "Insert failed" } }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(insertQueryBuilder);

      await expect(
        createReview(mockSupabaseClient as any, "city-1", "user-1", {
          title: "좋은 도시",
          content: "정말 좋은 도시입니다",
          rating: 5,
        })
      ).rejects.toThrow("Failed to create review: Insert failed");
    });
  });

  describe("updateReview()", () => {
    it("리뷰 수정", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const updateQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockReviewRaw, error: null }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(updateQueryBuilder);

      const result = await updateReview(
        mockSupabaseClient as any,
        "review-1",
        "user-1",
        { title: "수정된 제목", content: "수정된 내용", rating: 4 }
      );

      expect(updateQueryBuilder.update).toHaveBeenCalled();
      expect(result).toEqual(mockReviewRaw);
    });

    it("리뷰 수정 실패 시 에러", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const updateQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "Update failed" } }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(updateQueryBuilder);

      await expect(
        updateReview(mockSupabaseClient as any, "review-1", "user-1", {
          title: "수정된 제목",
          content: "수정된 내용",
          rating: 4,
        })
      ).rejects.toThrow("Failed to update review: Update failed");
    });

    it("updated_at 필드 자동 설정", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const updateQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockReviewRaw, error: null }),
      };

      (mockSupabaseClient.from as any).mockReturnValue(updateQueryBuilder);

      await updateReview(mockSupabaseClient as any, "review-1", "user-1", {
        title: "수정된 제목",
        content: "수정된 내용",
        rating: 4,
      });

      const updateCall = (updateQueryBuilder.update as any).mock.calls[0][0];
      expect(updateCall).toHaveProperty("updated_at");
    });
  });

  describe("deleteReview()", () => {
    it("리뷰 삭제", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const deleteQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      (mockSupabaseClient.from as any).mockReturnValue(deleteQueryBuilder);

      await deleteReview(mockSupabaseClient as any, "review-1", "user-1");

      expect(deleteQueryBuilder.delete).toHaveBeenCalled();
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
        deleteReview(mockSupabaseClient as any, "review-1", "user-1")
      ).rejects.toThrow("Failed to delete review: Delete failed");
    });
  });
});
