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
  convertDatabaseCityToCity,
  getCitiesList,
  getCityBySlug,
  getCityMetrics,
} from "@/lib/queries/cities";

// Mock 데이터
const mockCity = {
  id: "city-1",
  rank: 1,
  name: "서울",
  region: "seoul",
  province: "서울시",
  image_url: "https://example.com/seoul.jpg",
  overall_score: 4.5,
  review_count: 10,
  monthly_budget: 150,
  rent_studio: 500,
  internet_speed: 100,
  current_temp: 25,
  aqi_label: "좋음",
  cafe_count: 100,
  ktx_time: 0,
  likes: 50,
  dislikes: 5,
  tags: ["도시", "한국"],
  environment: ["nature", "urban"],
  best_season: "spring",
  city_metrics: null,
};

const mockCityWithMetrics = {
  ...mockCity,
  city_metrics: [
    {
      id: "metric-1",
      city_id: "city-1",
      monthly_budget: 180,
      rent_studio: 600,
      internet_speed: 150,
      current_temp: 28,
      aqi_label: "좋음",
    },
  ],
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

describe("lib/queries/cities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("convertDatabaseCityToCity()", () => {
    it("정상적인 DB 데이터를 City 타입으로 변환", () => {
      const result = convertDatabaseCityToCity(mockCity);

      expect(result.id).toBe("city-1");
      expect(result.name).toBe("서울");
      expect(result.rank).toBe(1);
      expect(result.region).toBe("seoul");
      expect(result.monthlyBudget).toBe(150);
      expect(result.rentStudio).toBe(500);
      expect(result.internetSpeed).toBe(100);
    });

    it("city_metrics가 있으면 우선 사용", () => {
      const result = convertDatabaseCityToCity(mockCityWithMetrics);

      expect(result.monthlyBudget).toBe(180);
      expect(result.rentStudio).toBe(600);
      expect(result.internetSpeed).toBe(150);
    });

    it("누락된 필드는 기본값으로 처리", () => {
      const partialCity = {
        id: "city-2",
        name: "부산",
        rank: 2,
      };

      const result = convertDatabaseCityToCity(partialCity);

      expect(result.monthlyBudget).toBe(0);
      expect(result.rentStudio).toBe(0);
      expect(result.cafeCount).toBe(0);
      expect(result.likes).toBe(0);
      expect(result.dislikes).toBe(0);
    });

    it("budget 필터링: 100 이하", () => {
      const city = { ...mockCity, monthly_budget: 80 };
      const result = convertDatabaseCityToCity(city);

      expect(result.budget).toBe("under100");
    });

    it("budget 필터링: 100~200", () => {
      const city = { ...mockCity, monthly_budget: 150 };
      const result = convertDatabaseCityToCity(city);

      expect(result.budget).toBe("100to200");
    });

    it("budget 필터링: 200 이상", () => {
      const city = { ...mockCity, monthly_budget: 250 };
      const result = convertDatabaseCityToCity(city);

      expect(result.budget).toBe("over200");
    });

    it("null/undefined 필드 처리", () => {
      const city = {
        ...mockCity,
        image_url: null,
        monthly_budget: undefined,
        tags: null,
      };

      const result = convertDatabaseCityToCity(city);

      expect(result.image).toBe("");
      expect(result.tags).toEqual([]);
    });

    it("월별 날씨 데이터가 month 기준으로 정렬됨", () => {
      const cityWithWeather = {
        ...mockCity,
        monthly_weather: [
          { month: 5, avg_temp: 20, max_temp: 25, min_temp: 15, rainfall: 100 },
          { month: 1, avg_temp: 0, max_temp: 5, min_temp: -5, rainfall: 30 },
          { month: 12, avg_temp: -2, max_temp: 3, min_temp: -7, rainfall: 20 },
          { month: 3, avg_temp: 10, max_temp: 15, min_temp: 5, rainfall: 50 },
        ],
      };

      const result = convertDatabaseCityToCity(cityWithWeather);

      expect(result.monthlyWeather).toBeDefined();
      expect(result.monthlyWeather).toHaveLength(4);
      expect(result.monthlyWeather![0].month).toBe(1);
      expect(result.monthlyWeather![1].month).toBe(3);
      expect(result.monthlyWeather![2].month).toBe(5);
      expect(result.monthlyWeather![3].month).toBe(12);
    });
  });

  describe("getCitiesList()", () => {
    it("기본 매개변수로 도시 목록 조회", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
      };

      const mockData = [mockCity];
      const count = 1;

      mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: mockData, error: null, count }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getCitiesList(mockSupabaseClient as any, {});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it("is_hidden=false 필터가 항상 적용됨", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData([mockCity], null, 1);
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: [mockCity], error: null, count: 1 }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getCitiesList(mockSupabaseClient as any, {});

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("is_hidden", false);
    });

    it("sort: score 정렬", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData([mockCity], null, 1);
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: [mockCity], error: null, count: 1 }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getCitiesList(mockSupabaseClient as any, { sort: "score" });

      expect(mockQueryBuilder.order).toHaveBeenCalledWith("overall_score", { ascending: false });
    });

    it("sort: budget-low 정렬", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData([mockCity], null, 1);
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: [mockCity], error: null, count: 1 }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getCitiesList(mockSupabaseClient as any, { sort: "budget-low" });

      expect(mockQueryBuilder.order).toHaveBeenCalledWith("monthly_budget", { ascending: true });
    });

    it("region 필터 적용", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData([mockCity], null, 1);
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: [mockCity], error: null, count: 1 }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getCitiesList(mockSupabaseClient as any, { region: "seoul" });

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("region", "seoul");
    });

    it("search 필터 적용", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData([mockCity], null, 1);
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: [mockCity], error: null, count: 1 }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getCitiesList(mockSupabaseClient as any, { search: "서울" });

      expect(mockQueryBuilder.ilike).toHaveBeenCalledWith("name", "%서울%");
    });

    it("budget 필터 적용: under100", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData([mockCity], null, 1);
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: [mockCity], error: null, count: 1 }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getCitiesList(mockSupabaseClient as any, { budget: "under100" });

      expect(mockQueryBuilder.lte).toHaveBeenCalledWith("monthly_budget", 100);
    });

    it("environment 필터 적용", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData([mockCity], null, 1);
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: [mockCity], error: null, count: 1 }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getCitiesList(mockSupabaseClient as any, { environment: "nature" });

      expect(mockQueryBuilder.contains).toHaveBeenCalledWith("environment", ["nature"]);
    });

    it("season 필터 적용", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData([mockCity], null, 1);
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: [mockCity], error: null, count: 1 }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getCitiesList(mockSupabaseClient as any, { season: "spring" });

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("best_season", "spring");
    });

    it("페이지네이션 적용", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData([mockCity], null, 12);
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: [mockCity], error: null, count: 12 }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getCitiesList(mockSupabaseClient as any, { limit: 12, offset: 12 });

      expect(mockQueryBuilder.range).toHaveBeenCalledWith(12, 23);
      expect(result.page).toBe(2);
    });

    it("데이터베이스 에러 처리", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData(null, { message: "Database error" });
      mockQueryBuilder.range.mockReturnValue({
        then: async (callback: any) => callback({ data: null, error: { message: "Database error" } }),
      });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await expect(getCitiesList(mockSupabaseClient as any, {})).rejects.toThrow(
        "Failed to fetch cities: Database error"
      );
    });
  });

  describe("getCityBySlug()", () => {
    it("UUID로 도시 조회", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      const mockQueryBuilder = createQueryBuilderWithData(mockCity);

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getCityBySlug(mockSupabaseClient as any, uuid);

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", uuid);
    });

    it("is_hidden=false 필터가 항상 적용됨", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData(mockCity);

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getCityBySlug(mockSupabaseClient as any, "서울");

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("is_hidden", false);
    });

    it("이름으로 도시 조회", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData(mockCity);

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await getCityBySlug(mockSupabaseClient as any, "서울");

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("name", "서울");
    });

    it("존재하지 않는 도시 조회", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData(null, { message: "No rows found" });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await expect(getCityBySlug(mockSupabaseClient as any, "없는도시")).rejects.toThrow(
        "City not found: 없는도시"
      );
    });

    it("데이터베이스 에러 처리", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData(null, { message: "Database error" });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      await expect(getCityBySlug(mockSupabaseClient as any, "서울")).rejects.toThrow(
        "City not found: 서울"
      );
    });
  });

  describe("getCityMetrics()", () => {
    it("도시 메트릭 조회", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const metrics = { id: "metric-1", city_id: "city-1", monthly_budget: 150 };

      const mockQueryBuilder = createQueryBuilderWithData(metrics);

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getCityMetrics(mockSupabaseClient as any, "city-1");

      expect(result).toEqual(metrics);
    });

    it("메트릭 없는 경우 null 반환", async () => {
      const mockSupabaseClient = { from: vi.fn() };

      const mockQueryBuilder = createQueryBuilderWithData(null, { message: "No rows found" });

      (mockSupabaseClient.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getCityMetrics(mockSupabaseClient as any, "city-1");

      expect(result).toBeNull();
    });
  });
});
