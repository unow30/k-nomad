/**
 * @vitest environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import Home from "@/app/page";
import { render } from "@testing-library/react";

// Mock getCitiesList
vi.mock("@/lib/supabase-queries", () => ({
  getCitiesList: vi.fn(),
}));

// Mock createClient
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: vi.fn(),
  })),
}));

// Mock components
vi.mock("@/components/layout/HeroSection", () => ({
  default: () => <div data-testid="hero-section">Hero</div>,
}));

vi.mock("@/components/filters/FilterBar", () => ({
  default: ({ initialSort, initialRegion, initialBudget, initialSearch, initialEnvironment, initialSeason }: any) => (
    <div data-testid="filter-bar">
      <span data-testid="sort">{initialSort}</span>
      <span data-testid="region">{initialRegion}</span>
      <span data-testid="budget">{initialBudget}</span>
      <span data-testid="search">{initialSearch}</span>
      <span data-testid="environment">{initialEnvironment}</span>
      <span data-testid="season">{initialSeason}</span>
    </div>
  ),
}));

vi.mock("@/components/city/CityCardGrid", () => ({
  default: ({ cities, limit = 12 }: any) => {
    const displayCities = cities.slice(0, limit);

    return (
      <div data-testid="city-card-grid">
        {displayCities.map((city: any) => (
          <div key={city.id} data-testid={`city-${city.id}`}>
            {city.name}
          </div>
        ))}
      </div>
    );
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children }: any) => <button data-testid="more-button">{children}</button>,
}));

import { getCitiesList } from "@/lib/supabase-queries";
import { City } from "@/types/city";

const mockCity: City = {
  id: "city-1",
  rank: 1,
  name: "서울",
  region: "seoul",
  province: "서울시",
  image: "https://example.com/seoul.jpg",
  overallScore: 4.5,
  reviewCount: 10,
  monthlyBudget: 150,
  rentStudio: 500,
  internetSpeed: 100,
  currentWeather: { temp: 25, aqi: 50, aqiLabel: "좋음", rainfall: 50 },
  cafeCount: 100,
  ktxTime: 0,
  likes: 50,
  dislikes: 5,
  tags: ["도시"],
  budget: "100to200",
  environment: ["nature"],
  bestSeason: "spring",
  description: undefined,
};

describe("app/page (Home)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("HeroSection을 렌더링", async () => {
    (getCitiesList as any).mockResolvedValue({
      data: [mockCity],
      total: 1,
      page: 1,
    });

    const { container } = render(
      await Home({ searchParams: Promise.resolve({}) })
    );

    expect(container.querySelector('[data-testid="hero-section"]')).toBeInTheDocument();
  });

  it("FilterBar를 렌더링하고 초기값을 전달", async () => {
    (getCitiesList as any).mockResolvedValue({
      data: [mockCity],
      total: 1,
      page: 1,
    });

    const { container } = render(
      await Home({ searchParams: Promise.resolve({}) })
    );

    const filterBar = container.querySelector('[data-testid="filter-bar"]');
    expect(filterBar).toBeInTheDocument();

    // 기본값 확인
    expect(container.querySelector('[data-testid="sort"]')).toHaveTextContent("score");
    expect(container.querySelector('[data-testid="region"]')).toHaveTextContent("all");
  });

  it("searchParams를 파싱하여 getCitiesList 호출", async () => {
    (getCitiesList as any).mockResolvedValue({
      data: [mockCity],
      total: 1,
      page: 1,
    });

    await Home({
      searchParams: Promise.resolve({
        sort: "budget-low",
        region: "seoul",
        budget: "under100",
        search: "서울",
        environment: "nature",
        season: "spring",
      }),
    });

    expect(getCitiesList).toHaveBeenCalledWith(
      expect.anything(), // supabase client
      {
        sort: "budget-low",
        region: "seoul",
        budget: "under100",
        search: "서울",
        environment: "nature",
        season: "spring",
        limit: 12,
        offset: 0,
      }
    );
  });

  it("getCitiesList 결과를 CityCardGrid에 전달", async () => {
    const cities = [mockCity, { ...mockCity, id: "city-2", name: "부산" }];

    (getCitiesList as any).mockResolvedValue({
      data: cities,
      total: 2,
      page: 1,
    });

    const { container } = render(
      await Home({ searchParams: Promise.resolve({}) })
    );

    const cityCardGrid = container.querySelector('[data-testid="city-card-grid"]');
    expect(cityCardGrid).toBeInTheDocument();

    // 도시들이 렌더링되었는지 확인
    expect(container.querySelector('[data-testid="city-city-1"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="city-city-2"]')).toBeInTheDocument();
  });

  it("결과가 12개 이상이면 더 보기 버튼을 표시", async () => {
    const cities = Array.from({ length: 15 }, (_, i) => ({
      ...mockCity,
      id: `city-${i}`,
      name: `도시${i}`,
    }));

    (getCitiesList as any).mockResolvedValue({
      data: cities,
      total: 15,
      page: 1,
    });

    const { container } = render(
      await Home({ searchParams: Promise.resolve({}) })
    );

    const moreButton = container.querySelector('[data-testid="more-button"]');
    expect(moreButton).toBeInTheDocument();
  });

  it("결과가 12개 이하이면 더 보기 버튼을 표시하지 않음", async () => {
    (getCitiesList as any).mockResolvedValue({
      data: [mockCity],
      total: 1,
      page: 1,
    });

    const { container } = render(
      await Home({ searchParams: Promise.resolve({}) })
    );

    const moreButton = container.querySelector('[data-testid="more-button"]');
    expect(moreButton).not.toBeInTheDocument();
  });

  it("sort 기본값은 'score'", async () => {
    (getCitiesList as any).mockResolvedValue({
      data: [mockCity],
      total: 1,
      page: 1,
    });

    const { container } = render(
      await Home({ searchParams: Promise.resolve({}) })
    );

    expect(getCitiesList).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ sort: "score" })
    );
  });

  it("region 기본값은 'all'", async () => {
    (getCitiesList as any).mockResolvedValue({
      data: [mockCity],
      total: 1,
      page: 1,
    });

    const { container } = render(
      await Home({ searchParams: Promise.resolve({}) })
    );

    expect(getCitiesList).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ region: "all" })
    );
  });

  it("search 기본값은 빈 문자열", async () => {
    (getCitiesList as any).mockResolvedValue({
      data: [mockCity],
      total: 1,
      page: 1,
    });

    const { container } = render(
      await Home({ searchParams: Promise.resolve({}) })
    );

    expect(getCitiesList).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ search: "" })
    );
  });

  it("environment 기본값은 undefined이고 FilterBar에는 'all'로 전달", async () => {
    (getCitiesList as any).mockResolvedValue({
      data: [mockCity],
      total: 1,
      page: 1,
    });

    const { container } = render(
      await Home({ searchParams: Promise.resolve({}) })
    );

    expect(getCitiesList).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ environment: undefined })
    );

    expect(container.querySelector('[data-testid="environment"]')).toHaveTextContent("all");
  });

  it("season 기본값은 undefined이고 FilterBar에는 'all'로 전달", async () => {
    (getCitiesList as any).mockResolvedValue({
      data: [mockCity],
      total: 1,
      page: 1,
    });

    const { container } = render(
      await Home({ searchParams: Promise.resolve({}) })
    );

    expect(getCitiesList).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ season: undefined })
    );

    expect(container.querySelector('[data-testid="season"]')).toHaveTextContent("all");
  });

  it("limit은 항상 12로 설정", async () => {
    (getCitiesList as any).mockResolvedValue({
      data: [mockCity],
      total: 1,
      page: 1,
    });

    const { container } = render(
      await Home({ searchParams: Promise.resolve({}) })
    );

    expect(getCitiesList).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ limit: 12, offset: 0 })
    );
  });

  it("빈 결과를 처리", async () => {
    (getCitiesList as any).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
    });

    const { container } = render(
      await Home({ searchParams: Promise.resolve({}) })
    );

    const cityCardGrid = container.querySelector('[data-testid="city-card-grid"]');
    expect(cityCardGrid).toBeInTheDocument();
  });
});
