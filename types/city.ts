import { Database } from "./database.types";

// Database enum 타입들을 직접 사용
export type AqiLabelType = Database["public"]["Enums"]["aqi_label_type"];
export type EnvironmentType = Database["public"]["Enums"]["environment_type"];
export type RegionType = Database["public"]["Enums"]["region_type"];
export type SeasonType = Database["public"]["Enums"]["season_type"];

/**
 * 생활비 상세 정보
 */
export interface CostBreakdown {
  /** 주거비 (단위: 만원) */
  housing: number;
  /** 식비 (단위: 만원) */
  food: number;
  /** 교통비 (단위: 만원) */
  transport: number;
  /** 여가/문화 (단위: 만원) */
  leisure: number;
}

/**
 * 월별 날씨 정보
 */
export interface MonthlyWeather {
  /** 월 (1-12) */
  month: number;
  /** 평균 기온 (단위: °C) */
  avgTemp: number;
  /** 최고 기온 (단위: °C) */
  maxTemp: number;
  /** 최저 기온 (단위: °C) */
  minTemp: number;
  /** 강수량 (단위: mm) */
  rainfall: number;
}

/**
 * 월별 미세먼지 정보
 */
export interface MonthlyAqi {
  /** 월 (1-12) */
  month: number;
  /** AQI 지수 */
  aqi: number;
  /** AQI 레이블 */
  label: AqiLabelType;
}

/**
 * 도시 정보 인터페이스
 */
export interface City {
  /** 고유 ID */
  id: string;
  /** 순위 */
  rank: number;
  /** 도시명 */
  name: string;
  /** 지역 (예: 강원, 제주 등) */
  region: RegionType;
  /** 광역시/도 (예: 강원특별자치도, 제주특별자치도) */
  province: string;
  /** 도시 대표 이미지 URL (Unsplash) */
  image: string;
  /** 종합 점수 (1-5) */
  overallScore: number;
  /** 리뷰 개수 */
  reviewCount: number;
  /** 월 생활비 (단위: 만원) */
  monthlyBudget: number;
  /** 원룸 월세 (단위: 만원) */
  rentStudio: number;
  /** 인터넷 속도 (단위: Mbps) */
  internetSpeed: number;

  /** 현재 날씨 및 환경 정보 */
  currentWeather: {
    /** 현재 기온 (단위: °C) */
    temp: number;
    /** 미세먼지 AQI */
    aqi: number;
    /** 미세먼지 라벨 */
    aqiLabel: AqiLabelType;
    /** 강수량 (단위: mm) */
    rainfall: number;
  };

  /** 카페/작업공간 개수 */
  cafeCount: number;
  /** 서울까지 KTX 소요 시간 (단위: 시간, 소수점 가능) */
  ktxTime: number;
  /** 좋아요 수 */
  likes: number;
  /** 싫어요 수 */
  dislikes: number;
  /** 태그 목록 */
  tags: string[];
  /** 예산 범위 (선택사항) */
  budget?: BudgetRange;
  /** 환경 특성 (복수 선택 가능, 선택사항) */
  environment?: Environment[];
  /** 최고 계절 (선택사항) */
  bestSeason?: BestSeason;
  /** 생활비 상세 정보 (선택사항) */
  costBreakdown?: CostBreakdown;
  /** 월별 평균 기온 데이터 (선택사항) */
  monthlyWeather?: MonthlyWeather[];
  /** 월별 미세먼지 데이터 (선택사항) */
  monthlyAqi?: MonthlyAqi[];
  /** 도시 설명 (선택사항) */
  description?: string;
}

/**
 * 지역 필터 옵션
 */
export const REGIONS = [
  { value: "all", label: "전체" },
  { value: "seoul", label: "수도권" },
  { value: "gangwon", label: "강원" },
  { value: "chungcheong", label: "충청" },
  { value: "jeolla", label: "전라" },
  { value: "gyeongsang", label: "경상" },
  { value: "jeju", label: "제주" },
] as const;

/**
 * 정렬 옵션
 */
export const SORT_OPTIONS = [
  { value: "score", label: "종합점수순" },
  { value: "budget-low", label: "생활비 낮은순" },
  { value: "budget-high", label: "생활비 높은순" },
  { value: "internet", label: "인터넷 빠른순" },
  { value: "reviews", label: "리뷰 많은순" },
] as const;

/**
 * 예산 범위 타입
 */
export type BudgetRange = "under100" | "100to200" | "over200";

/**
 * 예산 필터 옵션
 */
export const BUDGET_OPTIONS = [
  { value: "under100", label: "100만원 이하" },
  { value: "100to200", label: "100~200만원" },
  { value: "over200", label: "200만원 이상" },
] as const;

/**
 * 환경 타입
 */
export type Environment = EnvironmentType;

/**
 * 환경 필터 옵션
 */
export const ENVIRONMENT_OPTIONS = [
  { value: "nature", label: "자연친화" },
  { value: "urban", label: "도심선호" },
  { value: "cafe", label: "카페작업" },
  { value: "coworking", label: "코워킹 필수" },
] as const;

/**
 * 최고 계절 타입
 */
export type BestSeason = SeasonType;

/**
 * 계절 필터 옵션
 */
export const SEASON_OPTIONS = [
  { value: "spring", label: "봄" },
  { value: "summer", label: "여름" },
  { value: "fall", label: "가을" },
  { value: "winter", label: "겨울" },
] as const;

/**
 * 작업공간 타입
 */
export type WorkspaceType = "cafe" | "coworking";

/**
 * 작업공간 정보
 */
export interface Workspace {
  /** 고유 ID */
  id: string;
  /** 이름 */
  name: string;
  /** 타입 (카페/코워킹) */
  type: WorkspaceType;
  /** 주소 */
  address: string;
  /** 도심에서의 거리 (km) */
  distance: number;
  /** 평점 (1-5) */
  rating: number;
  /** 전원 콘센트 이용 가능 여부 */
  hasPower: boolean;
  /** 와이파이 속도 (Mbps) */
  wifiSpeed?: number;
  /** 영업시간 */
  hours?: string;
}

/**
 * 교통수단 타입
 */
export type TransportType = "ktx" | "bus" | "airplane";

/**
 * 교통 정보
 */
export interface Transportation {
  /** 도착 도시 */
  destination: string;
  /** 교통수단 */
  type: TransportType;
  /** 소요시간 (분) */
  duration: number;
  /** 요금 (원) */
  price?: number;
  /** 비고 */
  note?: string;
}

/**
 * 리뷰 정보
 */
export interface Review {
  /** 고유 ID */
  id: string;
  /** 작성자 이름 */
  authorName: string;
  /** 작성자 프로필 이미지 */
  authorImage?: string;
  /** 평점 (1-5) */
  rating: number;
  /** 리뷰 내용 */
  content: string;
  /** 작성일 */
  createdAt: string;
  /** 좋아요 수 */
  likes: number;
  /** 체류 기간 */
  stayDuration?: string;
}
