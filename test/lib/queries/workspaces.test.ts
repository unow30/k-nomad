import { describe, it, expect, beforeEach, vi } from "vitest";

const { mockFrom, supabase } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  supabase: { from: vi.fn() },
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => supabase),
}));

export { supabase, mockFrom };

import { getWorkspacesByCity } from "@/lib/queries/workspaces";

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

describe("lib/queries/workspaces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWorkspacesByCity()", () => {
    const mockWorkspace = {
      id: "workspace-1",
      city_id: "city-1",
      name: "스타벅스",
      type: "cafe",
      wifi_speed: 100,
      price_range: "medium",
      average_rating: 4.5,
    };

    it("도시별 작업공간 조회", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData([mockWorkspace], null, 1);
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: [mockWorkspace], error: null, count: 1 }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getWorkspacesByCity(mockSupabaseClient as any, "city-1");

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("is_hidden=false 필터가 항상 적용됨", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData([mockWorkspace], null, 1);
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: [mockWorkspace], error: null, count: 1 }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getWorkspacesByCity(mockSupabaseClient as any, "city-1");

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("is_hidden", false);
    });
  });
});
