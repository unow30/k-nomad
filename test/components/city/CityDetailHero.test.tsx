/**
 * @vitest environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CityDetailHero from "@/components/city/CityDetailHero";
import { City } from "@/types/city";

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-testid="city-image" />
  ),
}));

// Mock LikeDislikeButtons
vi.mock("@/components/city/LikeDislikeButtons", () => ({
  default: ({ cityId, initialUserLike, initialUserDislike }: any) => (
    <div
      data-testid="like-dislike-buttons"
      data-city-id={cityId}
      data-user-like={initialUserLike ? "true" : "false"}
      data-user-dislike={initialUserDislike ? "true" : "false"}
    >
      Like Dislike Buttons
    </div>
  ),
}));

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
  description: "매력적인 도시",
};

describe("CityDetailHero", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("도시명을 렌더링", () => {
    render(<CityDetailHero city={mockCity} />);

    expect(screen.getByText("🏙️ 서울")).toBeInTheDocument();
  });

  it("도시 지역을 렌더링", () => {
    const { container } = render(<CityDetailHero city={mockCity} />);

    expect(container.textContent).toContain("서울시");
  });

  it("도시 이미지를 렌더링", () => {
    render(<CityDetailHero city={mockCity} />);

    expect(screen.getByTestId("city-image")).toBeInTheDocument();
  });

  it("종합점수를 표시", () => {
    render(<CityDetailHero city={mockCity} />);

    expect(screen.getByText("⭐ 4.5")).toBeInTheDocument();
  });

  it("월 생활비를 표시", () => {
    render(<CityDetailHero city={mockCity} />);

    expect(screen.getByText("💵 150")).toBeInTheDocument();
  });

  it("인터넷 속도를 표시", () => {
    render(<CityDetailHero city={mockCity} />);

    expect(screen.getByText("📶 100")).toBeInTheDocument();
  });

  it("현재 기온을 표시", () => {
    render(<CityDetailHero city={mockCity} />);

    expect(screen.getByText("🌡️ 25°")).toBeInTheDocument();
  });

  it("리뷰 개수를 표시", () => {
    render(<CityDetailHero city={mockCity} />);

    expect(screen.getByText("10개 리뷰")).toBeInTheDocument();
  });

  it("설명이 있으면 표시", () => {
    render(<CityDetailHero city={mockCity} />);

    expect(screen.getByText("매력적인 도시")).toBeInTheDocument();
  });

  it("설명이 없으면 표시하지 않음", () => {
    const cityWithoutDescription = {
      ...mockCity,
      description: undefined,
    };

    render(<CityDetailHero city={cityWithoutDescription} />);

    expect(screen.queryByText("매력적인 도시")).not.toBeInTheDocument();
  });

  it("LikeDislikeButtons를 렌더링", () => {
    const { container } = render(
      <CityDetailHero
        city={mockCity}
        initialUserLike={true}
        initialUserDislike={false}
      />
    );

    expect(container.querySelector('[data-testid="like-dislike-buttons"]')).toBeInTheDocument();
  });

  it("LikeDislikeButtons에 초기값을 전달", () => {
    const { container } = render(
      <CityDetailHero
        city={mockCity}
        initialUserLike={true}
        initialUserDislike={false}
      />
    );

    const likeDislikeButtons = container.querySelector('[data-testid="like-dislike-buttons"]');
    expect(likeDislikeButtons).toHaveAttribute("data-city-id", "city-1");
  });
});
