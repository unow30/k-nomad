import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCityReaction,
  getCityReactions,
  toggleCityReaction,
} from "@/app/actions/city-reactions";

// Mock 정의
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Mock 데이터
const mockUser = {
  id: "user-123",
  email: "test@example.com",
};

const mockReaction = {
  city_like: true,
  city_dislike: false,
};

describe("app/actions/city-reactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCityReaction()", () => {
    it("인증된 사용자의 도시 반응을 조회", async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi
          .fn()
          .mockResolvedValue({
            data: mockReaction,
            error: null,
          }),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue(mockQueryBuilder),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getCityReaction("city-1");

      expect(result).toEqual(mockReaction);
      expect(mockSupabase.from).toHaveBeenCalledWith("user_city_reactions");
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        "city_like, city_dislike"
      );
    });

    it("미인증 사용자는 null 반환", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getCityReaction("city-1");

      expect(result).toBeNull();
    });

    it("도시 반응이 없으면 null 반환", async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue(mockQueryBuilder),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getCityReaction("city-1");

      expect(result).toBeNull();
    });

    it("데이터베이스 에러 발생 시 null 반환", async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue(mockQueryBuilder),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getCityReaction("city-1");

      expect(result).toBeNull();
    });
  });

  describe("getCityReactions()", () => {
    it("여러 도시의 반응을 일괄 조회", async () => {
      const mockData = [
        { city_id: "city-1", city_like: true, city_dislike: false },
        { city_id: "city-2", city_like: false, city_dislike: true },
      ];

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue(mockQueryBuilder),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getCityReactions(["city-1", "city-2"]);

      expect(result.get("city-1")).toEqual({
        city_like: true,
        city_dislike: false,
      });
      expect(result.get("city-2")).toEqual({
        city_like: false,
        city_dislike: true,
      });
    });

    it("미인증 사용자는 빈 Map 반환", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getCityReactions(["city-1", "city-2"]);

      expect(result.size).toBe(0);
    });

    it("빈 도시 ID 배열은 빈 Map 반환", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getCityReactions([]);

      expect(result.size).toBe(0);
    });
  });

  describe("toggleCityReaction()", () => {
    it("좋아요 토글 - 없음 → 좋아요", async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn((table: string) => {
          if (table === "user_city_reactions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
              upsert: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            };
          }
          return mockQueryBuilder;
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await toggleCityReaction("city-1", "like");

      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(revalidatePath).toHaveBeenCalledWith("/city/city-1");
    });

    it("좋아요 토글 - 좋아요 → 없음", async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            city_like: true,
            city_dislike: false,
          },
          error: null,
        }),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn((table: string) => {
          if (table === "user_city_reactions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  city_like: true,
                  city_dislike: false,
                },
                error: null,
              }),
              upsert: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            };
          }
          return mockQueryBuilder;
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await toggleCityReaction("city-1", "like");

      expect(result.success).toBe(true);
    });

    it("좋아요 → 싫어요로 전환", async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            city_like: true,
            city_dislike: false,
          },
          error: null,
        }),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn((table: string) => {
          if (table === "user_city_reactions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  city_like: true,
                  city_dislike: false,
                },
                error: null,
              }),
              upsert: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            };
          }
          return mockQueryBuilder;
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await toggleCityReaction("city-1", "dislike");

      expect(result.success).toBe(true);
    });

    it("미인증 사용자는 에러 반환", async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await toggleCityReaction("city-1", "like");

      expect(result.success).toBe(false);
      expect(result.error).toBe("로그인이 필요합니다");
    });

    it("UPSERT 실패 시 에러 반환", async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn((table: string) => {
          if (table === "user_city_reactions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
              upsert: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "UPSERT failed" },
              }),
            };
          }
          return mockQueryBuilder;
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await toggleCityReaction("city-1", "like");

      expect(result.success).toBe(false);
      expect(result.error).toBe("반응 업데이트에 실패했습니다");
    });

    it("getCityReaction 중 에러 발생 시 처리", async () => {
      // getCityReaction 함수가 에러를 throw하는 경우를 시뮬레이션
      const queryBuilderWithError = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockRejectedValue(new Error("Query error")),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn((table: string) => {
          if (table === "user_city_reactions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockRejectedValue(new Error("Query error")),
              upsert: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            };
          }
          return queryBuilderWithError;
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await toggleCityReaction("city-1", "like");

      expect(result.success).toBe(false);
      expect(result.error).toBe("예상치 못한 오류가 발생했습니다");
    });
  });
});
