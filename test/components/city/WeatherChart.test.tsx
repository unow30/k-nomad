/**
 * @vitest environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import WeatherChart from "@/components/city/WeatherChart";
import { City } from "@/types/city";

// Mock Recharts
vi.mock("recharts", () => ({
  LineChart: ({ data, children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: ({ name, dataKey }: any) => (
    <div data-testid={`line-${dataKey}`}>{name}</div>
  ),
  BarChart: ({ data, children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: any) => <div data-testid="bar">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: ({ label }: any) => (
    <div data-testid="y-axis">{label?.value}</div>
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

const mockCityWithWeather: City = {
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
  monthlyWeather: [
    {
      month: 1,
      maxTemp: 5,
      avgTemp: 0,
      minTemp: -5,
      rainfall: 20,
    },
    {
      month: 2,
      maxTemp: 8,
      avgTemp: 2,
      minTemp: -3,
      rainfall: 25,
    },
  ],
};

const mockCityWithoutWeather: City = {
  ...mockCityWithWeather,
  monthlyWeather: [],
};

describe("WeatherChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("정상 데이터로 차트를 렌더링", () => {
    render(<WeatherChart city={mockCityWithWeather} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("비어있는 데이터일 때 메시지를 표시", () => {
    render(<WeatherChart city={mockCityWithoutWeather} />);

    expect(screen.getByText("날씨 정보가 없습니다.")).toBeInTheDocument();
  });

  it("LineChart 컴포넌트를 렌더링", () => {
    render(<WeatherChart city={mockCityWithWeather} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("최고 기온, 평균 기온, 최저 기온 라인을 렌더링", () => {
    render(<WeatherChart city={mockCityWithWeather} />);

    expect(screen.getByTestId("line-maxTemp")).toBeInTheDocument();
    expect(screen.getByTestId("line-avgTemp")).toBeInTheDocument();
    expect(screen.getByTestId("line-minTemp")).toBeInTheDocument();
  });

  it("월별 강수량 그리드를 렌더링", () => {
    render(<WeatherChart city={mockCityWithWeather} />);

    expect(screen.getByText("🌧️ 월별 강수량")).toBeInTheDocument();
  });

  it("강수량이 100mm 초과일 때 표시", () => {
    const cityWithHighRainfall: City = {
      ...mockCityWithWeather,
      monthlyWeather: [
        {
          month: 1,
          maxTemp: 5,
          avgTemp: 0,
          minTemp: -5,
          rainfall: 120, // 100mm 이상
        },
      ],
    };

    render(<WeatherChart city={cityWithHighRainfall} />);

    expect(screen.getByText("☔ 많음")).toBeInTheDocument();
  });

  it("월별 강수량이 100mm 이하일 때 표시하지 않음", () => {
    const cityWithLowRainfall: City = {
      ...mockCityWithWeather,
      monthlyWeather: [
        {
          month: 1,
          maxTemp: 5,
          avgTemp: 0,
          minTemp: -5,
          rainfall: 50, // 100mm 이하
        },
      ],
    };

    render(<WeatherChart city={cityWithLowRainfall} />);

    expect(screen.queryByText("☔ 많음")).not.toBeInTheDocument();
  });

  it("제목을 렌더링", () => {
    render(<WeatherChart city={mockCityWithWeather} />);

    expect(screen.getByText("🌡️ 월별 날씨")).toBeInTheDocument();
  });

  it("monthlyWeather가 undefined일 때 메시지를 표시", () => {
    const cityWithoutWeatherData = {
      ...mockCityWithWeather,
      monthlyWeather: undefined,
    };

    render(<WeatherChart city={cityWithoutWeatherData} />);

    expect(screen.getByText("날씨 정보가 없습니다.")).toBeInTheDocument();
  });
});
