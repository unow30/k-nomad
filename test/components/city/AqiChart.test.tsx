/**
 * @vitest environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AqiChart from "@/components/city/AqiChart";
import { createMockCity, createMockMonthlyAqi } from "@/lib/mock-data-test";

// Mock Recharts
vi.mock("recharts", () => ({
  BarChart: ({ data, children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ dataKey, children }: any) => (
    <div data-testid={`bar-${dataKey}`}>{children}</div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: ({ label }: any) => (
    <div data-testid="y-axis">{label?.value}</div>
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Cell: ({ fill }: any) => (
    <div data-testid="cell" data-color={fill} />
  ),
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

const mockCityWithAqi = createMockCity({
  monthlyAqi: [
    createMockMonthlyAqi({ month: 1, aqi: 40, label: "좋음" }),
    createMockMonthlyAqi({ month: 2, aqi: 50, label: "좋음" }),
    createMockMonthlyAqi({ month: 3, aqi: 60, label: "보통" }),
  ],
});

const mockCityWithoutAqi = createMockCity({
  monthlyAqi: [],
});

describe("AqiChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("정상 데이터로 차트를 렌더링", () => {
    render(<AqiChart city={mockCityWithAqi} />);

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("비어있는 데이터일 때 메시지를 표시", () => {
    render(<AqiChart city={mockCityWithoutAqi} />);

    expect(screen.getByText("미세먼지 정보가 없습니다.")).toBeInTheDocument();
  });

  it("BarChart 컴포넌트를 렌더링", () => {
    render(<AqiChart city={mockCityWithAqi} />);

    expect(screen.getByTestId("bar-aqi")).toBeInTheDocument();
  });

  it("연간 평균 AQI를 계산하고 표시", () => {
    render(<AqiChart city={mockCityWithAqi} />);

    // (40 + 50 + 60) / 3 = 50
    expect(screen.getByText(/연간 평균 AQI:/)).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("평균 AQI의 라벨을 표시", () => {
    render(<AqiChart city={mockCityWithAqi} />);

    // 50은 "좋음" 범위
    expect(screen.getByText(/연간 평균 AQI:.*좋음/)).toBeInTheDocument();
  });

  it("AQI 범위 설명을 표시", () => {
    render(<AqiChart city={mockCityWithAqi} />);

    expect(screen.getByText("좋음")).toBeInTheDocument();
    expect(screen.getByText("보통")).toBeInTheDocument();
    expect(screen.getByText("나쁨")).toBeInTheDocument();
    expect(screen.getByText("매우나쁨")).toBeInTheDocument();
  });

  it("각 범위별 AQI 수치를 표시", () => {
    render(<AqiChart city={mockCityWithAqi} />);

    expect(screen.getByText("0-50")).toBeInTheDocument();
    expect(screen.getByText("51-100")).toBeInTheDocument();
    expect(screen.getByText("101-150")).toBeInTheDocument();
    expect(screen.getByText("150+")).toBeInTheDocument();
  });

  it("제목을 렌더링", () => {
    render(<AqiChart city={mockCityWithAqi} />);

    expect(screen.getByText("😷 월별 미세먼지 (AQI)")).toBeInTheDocument();
  });

  it("monthlyAqi가 undefined일 때 메시지를 표시", () => {
    const cityWithoutAqiData = {
      ...mockCityWithAqi,
      monthlyAqi: undefined,
    };

    render(<AqiChart city={cityWithoutAqiData} />);

    expect(screen.getByText("미세먼지 정보가 없습니다.")).toBeInTheDocument();
  });

  it("평균 AQI가 \"보통\" 범위일 때 올바른 라벨 표시", () => {
    const cityWithModerateAqi = createMockCity({
      monthlyAqi: [
        createMockMonthlyAqi({ month: 1, aqi: 75, label: "보통" }),
        createMockMonthlyAqi({ month: 2, aqi: 80, label: "보통" }),
      ],
    });

    render(<AqiChart city={cityWithModerateAqi} />);

    // (75 + 80) / 2 = 77.5 ≈ 78 (보통)
    expect(screen.getByText(/연간 평균 AQI:.*보통/)).toBeInTheDocument();
  });

  it("평균 AQI가 \"나쁨\" 범위일 때 올바른 라벨 표시", () => {
    const cityWithBadAqi = createMockCity({
      monthlyAqi: [
        createMockMonthlyAqi({ month: 1, aqi: 120, label: "나쁨" }),
        createMockMonthlyAqi({ month: 2, aqi: 130, label: "나쁨" }),
      ],
    });

    render(<AqiChart city={cityWithBadAqi} />);

    // (120 + 130) / 2 = 125 (나쁨)
    expect(screen.getByText(/연간 평균 AQI:.*나쁨/)).toBeInTheDocument();
  });
});
