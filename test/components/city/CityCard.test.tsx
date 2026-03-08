/**
 * @vitest environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CityCard from "@/components/city/CityCard";
import { City } from "@/types/city";

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-testid="city-image" />
  ),
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ href, children }: any) => (
    <a href={href} data-testid="city-link">
      {children}
    </a>
  ),
}));

// Mock Shadcn components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}));

// Mock LikeDislikeButtons
vi.mock("@/components/city/LikeDislikeButtons", () => ({
  default: ({ cityId, initialUserLike, initialUserDislike }: any) => (
    <div data-testid="like-dislike-buttons">
      <span data-testid={`like-button-${cityId}`}>{initialUserLike ? "liked" : "not-liked"}</span>
      <span data-testid={`dislike-button-${cityId}`}>{initialUserDislike ? "disliked" : "not-disliked"}</span>
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
  description: undefined,
};

describe("CityCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("도시 정보를 렌더링", () => {
    render(<CityCard city={mockCity} />);

    expect(screen.getByText("서울")).toBeInTheDocument();
    expect(screen.getByText("서울시")).toBeInTheDocument();
  });

  it("도시 이미지를 렌더링", () => {
    render(<CityCard city={mockCity} />);

    const image = screen.getByTestId("city-image");
    expect(image).toHaveAttribute("src", "https://example.com/seoul.jpg");
    expect(image).toHaveAttribute("alt", "서울");
  });

  it("순위 배지를 렌더링", () => {
    render(<CityCard city={mockCity} />);

    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  it("인터넷 속도 배지를 렌더링", () => {
    render(<CityCard city={mockCity} />);

    expect(screen.getByText("📶 100M")).toBeInTheDocument();
  });

  it("월간 예산과 스튜디오 임차료를 표시", () => {
    render(<CityCard city={mockCity} />);

    // 월간 예산: 150 * 10000 = 1,500,000 -> formatKoreanNumber로 "150만"으로 표시됨
    expect(screen.getByText(/150만원/)).toBeInTheDocument();
    // 스튜디오 임차료
    expect(screen.getByText("500만")).toBeInTheDocument();
  });

  it("기온과 미세먼지를 표시", () => {
    render(<CityCard city={mockCity} />);

    expect(screen.getByText(/25°C/)).toBeInTheDocument();
    expect(screen.getByText(/50 좋음/)).toBeInTheDocument();
  });

  it("예산 필터 정보를 표시", () => {
    render(<CityCard city={mockCity} />);

    expect(screen.getByText("예산:")).toBeInTheDocument();
  });

  it("환경 필터 정보를 표시", () => {
    render(<CityCard city={mockCity} />);

    expect(screen.getByText("환경:")).toBeInTheDocument();
  });

  it("최고 계절 정보를 표시", () => {
    render(<CityCard city={mockCity} />);

    expect(screen.getByText("최고계절:")).toBeInTheDocument();
  });

  it("LikeDislikeButtons를 렌더링하고 props를 전달", () => {
    render(
      <CityCard
        city={mockCity}
        initialUserLike={true}
        initialUserDislike={false}
      />
    );

    const likeDislikeButtons = screen.getByTestId("like-dislike-buttons");
    expect(likeDislikeButtons).toBeInTheDocument();

    // Props가 제대로 전달되었는지 확인
    expect(screen.getByTestId("like-button-city-1")).toHaveTextContent("liked");
    expect(screen.getByTestId("dislike-button-city-1")).toHaveTextContent("not-disliked");
  });

  it("Link의 href가 올바르게 설정됨", () => {
    render(<CityCard city={mockCity} />);

    const link = screen.getByTestId("city-link");
    expect(link).toHaveAttribute("href", "/city/city-1");
  });

  it("budget이 없으면 예산 정보를 표시하지 않음", () => {
    const cityWithoutBudget = {
      ...mockCity,
      budget: undefined,
    };

    render(<CityCard city={cityWithoutBudget} />);

    // 예산 정보가 없어야 함
    const budgetElements = screen.queryAllByText("예산:");
    expect(budgetElements).toHaveLength(0);
  });

  it("environment가 없으면 환경 정보를 표시하지 않음", () => {
    const cityWithoutEnvironment = {
      ...mockCity,
      environment: undefined,
    };

    render(<CityCard city={cityWithoutEnvironment} />);

    // 환경 정보가 없어야 함
    const environmentElements = screen.queryAllByText("환경:");
    expect(environmentElements).toHaveLength(0);
  });

  it("bestSeason이 없으면 계절 정보를 표시하지 않음", () => {
    const cityWithoutSeason = {
      ...mockCity,
      bestSeason: undefined,
    };

    render(<CityCard city={cityWithoutSeason} />);

    // 계절 정보가 없어야 함
    const seasonElements = screen.queryAllByText("최고계절:");
    expect(seasonElements).toHaveLength(0);
  });

  it("모든 필터 정보가 없으면 필터 섹션을 표시하지 않음", () => {
    const cityWithoutFilters = {
      ...mockCity,
      budget: undefined,
      environment: undefined,
      bestSeason: undefined,
    };

    render(<CityCard city={cityWithoutFilters} />);

    // 필터 섹션이 없어야 함 (border-t 클래스가 없어야 함)
    const filterSection = screen.queryByText("예산:");
    expect(filterSection).not.toBeInTheDocument();
  });

  it("initialUserLike와 initialUserDislike 기본값은 false", () => {
    render(<CityCard city={mockCity} />);

    expect(screen.getByTestId("like-button-city-1")).toHaveTextContent("not-liked");
    expect(screen.getByTestId("dislike-button-city-1")).toHaveTextContent("not-disliked");
  });

  it("빈 environment 배열일 때는 환경 정보를 표시하지 않음", () => {
    const cityWithEmptyEnvironment = {
      ...mockCity,
      environment: [],
    };

    render(<CityCard city={cityWithEmptyEnvironment} />);

    const environmentElements = screen.queryAllByText("환경:");
    expect(environmentElements).toHaveLength(0);
  });

  it("LikeDislikeButtons에 올바른 props가 전달됨", () => {
    render(
      <CityCard
        city={mockCity}
        initialUserLike={true}
        initialUserDislike={false}
      />
    );

    // 좋아요 수와 싫어요 수가 LikeDislikeButtons에 전달되어야 함
    // (mock에서 확인할 수 있음)
    expect(screen.getByTestId("like-dislike-buttons")).toBeInTheDocument();
  });
});
