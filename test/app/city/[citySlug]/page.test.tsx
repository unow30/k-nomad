/**
 * @vitest environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import CityDetailPage from "@/app/city/[citySlug]/page";
import { render } from "@testing-library/react";

// Mock navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

// Mock dynamic imports
vi.mock("next/dynamic", () => ({
  default: (importFunc: any, options?: any) => {
    if (options?.loading) {
      return options.loading;
    }
    return () => <div data-testid="dynamic-component" />;
  },
}));

// Mock createClient
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: vi.fn(),
  })),
}));

// Mock Supabase queries
vi.mock("@/lib/supabase-queries", () => ({
  getCityBySlug: vi.fn(),
  getCityReviews: vi.fn(),
}));

// Mock city-reactions action
vi.mock("@/app/actions/city-reactions", () => ({
  getCityReaction: vi.fn(),
}));

// Mock components
vi.mock("@/components/city/CityDetailHero", () => ({
  default: ({ city }: any) => (
    <div data-testid="city-detail-hero">{city.name}</div>
  ),
}));

vi.mock("@/components/city/CityJsonLd", () => ({
  default: () => <div data-testid="city-json-ld" />,
}));

import { getCityBySlug, getCityReviews } from "@/lib/supabase-queries";
import { getCityReaction } from "@/app/actions/city-reactions";
import { notFound } from "next/navigation";
import { City, Review } from "@/types/city";

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

const mockReviews: Review[] = [
  {
    id: "review-1",
    authorName: "홍길동",
    authorImage: "https://example.com/avatar.jpg",
    rating: 5,
    content: "좋은 도시입니다",
    createdAt: "2024-01-01T00:00:00Z",
    likes: 10,
  },
];

describe("app/city/[citySlug]/page (CityDetailPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("도시 정보를 조회하고 렌더링", async () => {
    (getCityBySlug as any).mockResolvedValue(mockCity);
    (getCityReviews as any).mockResolvedValue(mockReviews);
    (getCityReaction as any).mockResolvedValue({ city_like: false, city_dislike: false });

    const { container } = render(
      await CityDetailPage({ params: Promise.resolve({ citySlug: "서울" }) })
    );

    expect(container.textContent).toContain("서울");
  });

  it("getCityBySlug를 호출하여 도시 정보 조회", async () => {
    (getCityBySlug as any).mockResolvedValue(mockCity);
    (getCityReviews as any).mockResolvedValue(mockReviews);
    (getCityReaction as any).mockResolvedValue({ city_like: false, city_dislike: false });

    await CityDetailPage({ params: Promise.resolve({ citySlug: "서울" }) });

    expect(getCityBySlug).toHaveBeenCalledWith(expect.anything(), "서울");
  });

  it("getCityReviews를 호출하여 리뷰 조회", async () => {
    (getCityBySlug as any).mockResolvedValue(mockCity);
    (getCityReviews as any).mockResolvedValue(mockReviews);
    (getCityReaction as any).mockResolvedValue({ city_like: false, city_dislike: false });

    await CityDetailPage({ params: Promise.resolve({ citySlug: "서울" }) });

    expect(getCityReviews).toHaveBeenCalledWith(expect.anything(), mockCity.id, 10);
  });

  it("getCityReaction을 호출하여 사용자 반응 조회", async () => {
    (getCityBySlug as any).mockResolvedValue(mockCity);
    (getCityReviews as any).mockResolvedValue(mockReviews);
    (getCityReaction as any).mockResolvedValue({ city_like: false, city_dislike: false });

    await CityDetailPage({ params: Promise.resolve({ citySlug: "서울" }) });

    expect(getCityReaction).toHaveBeenCalledWith(mockCity.id);
  });

  it("도시 조회 실패 시 notFound() 호출", async () => {
    (getCityBySlug as any).mockRejectedValue(new Error("City not found"));

    try {
      await CityDetailPage({ params: Promise.resolve({ citySlug: "없는도시" }) });
    } catch (error: any) {
      expect(error.message).toBe("NOT_FOUND");
    }

    expect(notFound).toHaveBeenCalled();
  });

  it("CityDetailHero 컴포넌트를 렌더링", async () => {
    (getCityBySlug as any).mockResolvedValue(mockCity);
    (getCityReviews as any).mockResolvedValue(mockReviews);
    (getCityReaction as any).mockResolvedValue({ city_like: true, city_dislike: false });

    const { container } = render(
      await CityDetailPage({ params: Promise.resolve({ citySlug: "서울" }) })
    );

    expect(container.querySelector('[data-testid="city-detail-hero"]')).toBeInTheDocument();
  });

  it("CityJsonLd 컴포넌트를 렌더링 (SEO 최적화)", async () => {
    (getCityBySlug as any).mockResolvedValue(mockCity);
    (getCityReviews as any).mockResolvedValue(mockReviews);
    (getCityReaction as any).mockResolvedValue({ city_like: false, city_dislike: false });

    const { container } = render(
      await CityDetailPage({ params: Promise.resolve({ citySlug: "서울" }) })
    );

    expect(container.querySelector('[data-testid="city-json-ld"]')).toBeInTheDocument();
  });
});
