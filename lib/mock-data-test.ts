/**
 * 테스트 코드용 Mock 데이터
 * 모든 타입이 올바르게 정의된 재사용 가능한 목데이터
 */
import { City, MonthlyAqi, MonthlyWeather, CostBreakdown } from "@/types/city";

/**
 * 기본 City Mock 데이터
 */
export const createMockCity = (overrides?: Partial<City>): City => ({
  id: "city-1",
  rank: 1,
  name: "테스트도시",
  region: "seoul",
  province: "서울시",
  image: "https://example.com/test.jpg",
  overallScore: 4.5,
  reviewCount: 10,
  monthlyBudget: 150,
  rentStudio: 50,
  internetSpeed: 100,
  currentWeather: { temp: 25, aqi: 50, aqiLabel: "좋음", rainfall: 50 },
  cafeCount: 100,
  ktxTime: 0,
  likes: 50,
  dislikes: 5,
  tags: ["도시", "한국"],
  environment: ["nature", "urban"],
  bestSeason: "spring",
  description: "테스트 도시입니다",
  ...overrides,
});

/**
 * MonthlyWeather Mock 데이터
 */
export const createMockMonthlyWeather = (overrides?: Partial<MonthlyWeather>): MonthlyWeather => ({
  month: 1,
  avgTemp: 10,
  maxTemp: 15,
  minTemp: 5,
  rainfall: 50,
  ...overrides,
});

/**
 * MonthlyAqi Mock 데이터
 */
export const createMockMonthlyAqi = (overrides?: Partial<MonthlyAqi>): MonthlyAqi => ({
  month: 1,
  aqi: 50,
  label: "좋음",
  ...overrides,
});

/**
 * CostBreakdown Mock 데이터
 */
export const createMockCostBreakdown = (overrides?: Partial<CostBreakdown>): CostBreakdown => ({
  housing: 40,
  food: 35,
  transport: 15,
  leisure: 20,
  ...overrides,
});

/**
 * 전체 정보를 포함한 City Mock 데이터
 */
export const createMockCityWithAllData = (overrides?: Partial<City>): City => {
  const monthlyWeatherData: MonthlyWeather[] = Array.from({ length: 12 }, (_, i) =>
    createMockMonthlyWeather({ month: i + 1 })
  );

  const monthlyAqiData: MonthlyAqi[] = Array.from({ length: 12 }, (_, i) =>
    createMockMonthlyAqi({ month: i + 1 })
  );

  const costBreakdown: CostBreakdown = createMockCostBreakdown();

  return createMockCity({
    monthlyWeather: monthlyWeatherData,
    monthlyAqi: monthlyAqiData,
    costBreakdown,
    ...overrides,
  });
};

/**
 * 여러 도시의 Mock 데이터 배열
 */
export const createMockCities = (count: number = 3): City[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockCity({
      id: `city-${i + 1}`,
      rank: i + 1,
      name: `도시${i + 1}`,
    })
  );
};

/**
 * 특정 environment를 가진 City Mock 데이터
 */
export const createMockCityWithEnvironment = (
  environment: ("nature" | "urban" | "cafe" | "coworking")[]
): City => {
  return createMockCity({ environment });
};
