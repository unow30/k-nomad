/**
 * @vitest environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CostBreakdownChart from "@/components/city/CostBreakdownChart";
import { City } from "@/types/city";

// Mock Recharts
vi.mock("recharts", () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data, children }: any) => (
    <div data-testid="pie" data-items={data?.length}>
      {children}
    </div>
  ),
  Cell: ({ fill }: any) => (
    <div data-testid="cell" data-color={fill} />
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

const mockCityWithCostBreakdown: City = {
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
  costBreakdown: {
    housing: 50,
    food: 40,
    transport: 30,
    leisure: 20,
  },
};

const mockCityWithoutCostBreakdown: City = {
  ...mockCityWithCostBreakdown,
  costBreakdown: undefined,
};

describe("CostBreakdownChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("정상 데이터로 차트를 렌더링", () => {
    render(<CostBreakdownChart city={mockCityWithCostBreakdown} />);

    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("비어있는 데이터일 때 메시지를 표시", () => {
    render(<CostBreakdownChart city={mockCityWithoutCostBreakdown} />);

    expect(screen.getByText("생활비 정보가 없습니다.")).toBeInTheDocument();
  });

  it("PieChart 컴포넌트를 렌더링", () => {
    render(<CostBreakdownChart city={mockCityWithCostBreakdown} />);

    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("생활비 항목별 정보를 표시", () => {
    render(<CostBreakdownChart city={mockCityWithCostBreakdown} />);

    expect(screen.getByText("🏠")).toBeInTheDocument(); // 주거비
    expect(screen.getByText("🍽️")).toBeInTheDocument(); // 식비
    expect(screen.getByText("🚗")).toBeInTheDocument(); // 교통비
    expect(screen.getByText("🎭")).toBeInTheDocument(); // 여가/문화
  });

  it("월간 예상 생활비를 계산하고 표시", () => {
    render(<CostBreakdownChart city={mockCityWithCostBreakdown} />);

    // 50 + 40 + 30 + 20 = 140만원
    expect(screen.getByText(/월간 예상 생활비:/)).toBeInTheDocument();
    expect(screen.getByText("140만원")).toBeInTheDocument();
  });

  it("각 항목의 금액을 표시", () => {
    render(<CostBreakdownChart city={mockCityWithCostBreakdown} />);

    expect(screen.getByText("50만원")).toBeInTheDocument(); // 주거비
    expect(screen.getByText("40만원")).toBeInTheDocument(); // 식비
    expect(screen.getByText("30만원")).toBeInTheDocument(); // 교통비
    expect(screen.getByText("20만원")).toBeInTheDocument(); // 여가/문화
  });

  it("각 항목의 비율을 표시", () => {
    render(<CostBreakdownChart city={mockCityWithCostBreakdown} />);

    // 50 / 140 * 100 = 35.7%
    // 40 / 140 * 100 = 28.6%
    // 30 / 140 * 100 = 21.4%
    // 20 / 140 * 100 = 14.3%

    expect(screen.getByText(/35\.7%/)).toBeInTheDocument();
    expect(screen.getByText(/28\.6%/)).toBeInTheDocument();
    expect(screen.getByText(/21\.4%/)).toBeInTheDocument();
    expect(screen.getByText(/14\.3%/)).toBeInTheDocument();
  });

  it("제목을 렌더링", () => {
    render(<CostBreakdownChart city={mockCityWithCostBreakdown} />);

    expect(screen.getByText("💰 생활비 분석")).toBeInTheDocument();
  });

  it("costBreakdown이 undefined일 때 메시지를 표시", () => {
    const cityWithoutCostData = {
      ...mockCityWithCostBreakdown,
      costBreakdown: undefined,
    };

    render(<CostBreakdownChart city={cityWithoutCostData} />);

    expect(screen.getByText("생활비 정보가 없습니다.")).toBeInTheDocument();
  });

  it("항목 이름을 표시", () => {
    render(<CostBreakdownChart city={mockCityWithCostBreakdown} />);

    expect(screen.getByText("주거비")).toBeInTheDocument();
    expect(screen.getByText("식비")).toBeInTheDocument();
    expect(screen.getByText("교통비")).toBeInTheDocument();
    expect(screen.getByText("여가/문화")).toBeInTheDocument();
  });

  it("프로그레스 바가 렌더링됨", () => {
    const { container } = render(
      <CostBreakdownChart city={mockCityWithCostBreakdown} />
    );

    // 각 항목에 대해 프로그레스 바가 4개 있어야 함
    const progressBars = container.querySelectorAll(
      ".h-2.rounded-full.bg-muted-foreground\\/10"
    );
    // 항목이 4개이므로 프로그레스 바도 4개여야 함
    expect(progressBars.length).toBeGreaterThanOrEqual(4);
  });

  it("다양한 비용 조합을 처리", () => {
    const cityWithDifferentCosts: City = {
      ...mockCityWithCostBreakdown,
      costBreakdown: {
        housing: 100,
        food: 50,
        transport: 20,
        leisure: 30,
      },
    };

    render(<CostBreakdownChart city={cityWithDifferentCosts} />);

    // 100 + 50 + 20 + 30 = 200만원
    expect(screen.getByText("200만원")).toBeInTheDocument();
  });
});
