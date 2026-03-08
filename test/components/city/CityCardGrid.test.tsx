/**
 * @vitest environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import CityCardGrid from "@/components/city/CityCardGrid";
import { render } from "@testing-library/react";

// Mock getCityReactions
vi.mock("@/app/actions/city-reactions", () => ({
  getCityReactions: vi.fn(),
}));

// Mock CityCard 컴포넌트
vi.mock("@/components/city/CityCard", () => ({
  default: ({ city, initialUserLike, initialUserDislike }: any) => (
    <div data-testid={`city-card-${city.id}`}>
      {city.name}
      <span data-testid={`like-${city.id}`}>{initialUserLike ? "liked" : "not-liked"}</span>
      <span data-testid={`dislike-${city.id}`}>{initialUserDislike ? "disliked" : "not-disliked"}</span>
    </div>
  ),
}));

import { getCityReactions } from "@/app/actions/city-reactions";
import { City } from "@/types/city";

const mockCities: City[] = [
  {
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
  },
  {
    id: "city-2",
    rank: 2,
    name: "부산",
    region: "gyeongsang",
    province: "부산시",
    image: "https://example.com/busan.jpg",
    overallScore: 4.2,
    reviewCount: 8,
    monthlyBudget: 120,
    rentStudio: 450,
    internetSpeed: 95,
    currentWeather: { temp: 26, aqi: 55, aqiLabel: "좋음", rainfall: 50 },
    cafeCount: 80,
    ktxTime: 3,
    likes: 40,
    dislikes: 3,
    tags: ["해변"],
    budget: "100to200",
    environment: ["urban"],
    bestSeason: "summer",
    description: undefined,
  },
  {
    id: "city-3",
    rank: 3,
    name: "대구",
    region: "gyeongsang",
    province: "대구시",
    image: "https://example.com/daegu.jpg",
    overallScore: 4.0,
    reviewCount: 6,
    monthlyBudget: 100,
    rentStudio: 400,
    internetSpeed: 90,
    currentWeather: { temp: 27, aqi: 60, aqiLabel: "보통", rainfall: 50 },
    cafeCount: 60,
    ktxTime: 1,
    likes: 30,
    dislikes: 2,
    tags: ["도시"],
    budget: "100to200",
    environment: ["urban"],
    bestSeason: "spring",
    description: undefined,
  },
];

describe("CityCardGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("도시 카드를 여러 개 렌더링", async () => {
    (getCityReactions as any).mockResolvedValue(new Map());

    const { container } = render(
      await CityCardGrid({ cities: mockCities })
    );

    // 각 도시 카드가 렌더링되었는지 확인
    const cityCards = container.querySelectorAll('[data-testid^="city-card-"]');
    expect(cityCards).toHaveLength(3);
  });

  it("limit 이상의 도시는 표시하지 않음", async () => {
    (getCityReactions as any).mockResolvedValue(new Map());

    const { container } = render(
      await CityCardGrid({ cities: mockCities, limit: 2 })
    );

    const cityCards = container.querySelectorAll('[data-testid^="city-card-"]');
    expect(cityCards).toHaveLength(2);
  });

  it("getCityReactions 호출 확인", async () => {
    (getCityReactions as any).mockResolvedValue(new Map());

    render(await CityCardGrid({ cities: mockCities }));

    expect(getCityReactions).toHaveBeenCalledWith([
      "city-1",
      "city-2",
      "city-3",
    ]);
  });

  it("사용자 반응을 CityCard에 전달", async () => {
    const reactions = new Map([
      [
        "city-1",
        {
          city_id: "city-1",
          city_like: true,
          city_dislike: false,
        },
      ],
      [
        "city-2",
        {
          city_id: "city-2",
          city_like: false,
          city_dislike: true,
        },
      ],
    ]);

    (getCityReactions as any).mockResolvedValue(reactions);

    const { container } = render(
      await CityCardGrid({ cities: mockCities })
    );

    // city-1은 좋아요 true
    expect(container.querySelector('[data-testid="like-city-1"]')).toHaveTextContent("liked");
    expect(container.querySelector('[data-testid="dislike-city-1"]')).toHaveTextContent("not-disliked");

    // city-2는 싫어요 true
    expect(container.querySelector('[data-testid="like-city-2"]')).toHaveTextContent("not-liked");
    expect(container.querySelector('[data-testid="dislike-city-2"]')).toHaveTextContent("disliked");

    // city-3는 반응 없음
    expect(container.querySelector('[data-testid="like-city-3"]')).toHaveTextContent("not-liked");
    expect(container.querySelector('[data-testid="dislike-city-3"]')).toHaveTextContent("not-disliked");
  });

  it("빈 도시 목록 처리", async () => {
    (getCityReactions as any).mockResolvedValue(new Map());

    const { container } = render(
      await CityCardGrid({ cities: [] })
    );

    const cityCards = container.querySelectorAll('[data-testid^="city-card-"]');
    expect(cityCards).toHaveLength(0);
  });

  it("기본 limit은 12", async () => {
    const manyCities = Array.from({ length: 20 }, (_, i) => ({
      ...mockCities[0],
      id: `city-${i}`,
      name: `도시${i}`,
    }));

    (getCityReactions as any).mockResolvedValue(new Map());

    const { container } = render(
      await CityCardGrid({ cities: manyCities })
    );

    const cityCards = container.querySelectorAll('[data-testid^="city-card-"]');
    expect(cityCards).toHaveLength(12);
  });

  it("그리드 클래스가 적용됨", async () => {
    (getCityReactions as any).mockResolvedValue(new Map());

    const { container } = render(
      await CityCardGrid({ cities: mockCities })
    );

    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-6");
  });
});
