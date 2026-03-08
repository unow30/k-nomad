import { Database } from "./database.types";

// Database enum 타입들을 직접 사용
export type WorkspaceTypeEnum = Database["public"]["Enums"]["workspace_type"];
export type PriceRangeType = Database["public"]["Enums"]["price_range_type"];

/**
 * 작업 공간 기본 정보
 */
export interface Workspace {
  /** 고유 ID */
  id: string;
  /** 도시 ID */
  cityId: string;
  /** 도시 이름 (breadcrumb용, cities JOIN 조회 시에만 존재) */
  cityName?: string;

  /** 이름 */
  name: string;
  /** 영문 이름 */
  nameEn?: string;
  /** 타입 (카페/코워킹/도서관 등) */
  type: WorkspaceTypeEnum;
  /** 주소 */
  address: string;
  /** 설명 */
  description?: string;

  /** WiFi 속도 (Mbps) */
  wifiSpeed?: number;
  /** 콘센트 이용 가능 여부 */
  hasPower: boolean;
  /** 가격대 */
  priceRange: PriceRangeType;
  /** 영업시간 */
  openingHours?: string;

  /** 전화번호 */
  phone?: string;
  /** 웹사이트 */
  website?: string;

  /** 위도 */
  latitude?: number;
  /** 경도 */
  longitude?: number;

  /** 대표 이미지 URL */
  imageUrl?: string;

  /** 평균 평점 (1-5) */
  averageRating: number;
  /** 리뷰 개수 */
  reviewCount: number;

  /** 데이터 출처 */
  dataSource?: string;

  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
}

/**
 * 작업 공간 리뷰 정보
 */
export interface WorkspaceReview {
  /** 고유 ID */
  id: string;
  /** 작업 공간 ID */
  workspaceId: string;
  /** 사용자 ID */
  userId: string;

  /** 리뷰 제목 */
  title: string;
  /** 리뷰 내용 */
  content: string;
  /** 평점 (1-5) */
  rating: number;
  /** 방문 날짜 */
  visitedAt?: string;
  /** 추천 여부 */
  isRecommended: boolean;
  /** 이미지 포함 여부 */
  has_images?: boolean;
  /** 리뷰 이미지 목록 */
  images?: Array<{
    id: string;
    image_url: string;
    caption?: string | null;
    display_order: number;
  }>;

  /** 작성자 정보 (조인 결과) */
  author?: {
    username?: string;
    profileImage?: string;
  };

  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
}

/**
 * 작업 공간 타입 필터 옵션
 */
export const WORKSPACE_TYPE_OPTIONS = [
  { value: "cafe", label: "카페" },
  { value: "coworking", label: "코워킹 스페이스" },
  { value: "library", label: "도서관" },
  { value: "hotel_lobby", label: "호텔 로비" },
  { value: "other", label: "기타" },
] as const;

/**
 * 가격대 필터 옵션
 */
export const PRICE_RANGE_OPTIONS = [
  { value: "free", label: "무료" },
  { value: "low", label: "저렴 (1만원 이하)" },
  { value: "medium", label: "보통 (1-3만원)" },
  { value: "high", label: "고가 (3만원 이상)" },
] as const;

/**
 * 작업 공간 정렬 옵션
 */
export const WORKSPACE_SORT_OPTIONS = [
  { value: "rating", label: "평점순" },
  { value: "reviews", label: "리뷰 많은순" },
  { value: "wifi-speed", label: "WiFi 빠른순" },
  { value: "price-low", label: "가격 낮은순" },
  { value: "price-high", label: "가격 높은순" },
] as const;

/**
 * 작업공간 제안 정보
 */
export interface WorkspaceSuggestion {
  /** 고유 ID */
  id: string;
  /** 도시 ID */
  cityId: string;
  /** 제안자 사용자 ID */
  userId: string;

  /** 이름 */
  name: string;
  /** 영문 이름 */
  nameEn?: string;
  /** 타입 (카페/코워킹/도서관 등) */
  type: WorkspaceTypeEnum;
  /** 주소 */
  address: string;
  /** 설명 */
  description?: string;

  /** WiFi 속도 (Mbps) */
  wifiSpeed?: number;
  /** 콘센트 이용 가능 여부 */
  hasPower: boolean;
  /** 가격대 */
  priceRange?: PriceRangeType;
  /** 영업시간 */
  openingHours?: string;

  /** 전화번호 */
  phone?: string;
  /** 웹사이트 */
  website?: string;

  /** 위도 */
  latitude?: number;
  /** 경도 */
  longitude?: number;

  /** Storage 이미지 경로 */
  imagePath?: string;

  /** 제안 상태 (pending/approved/rejected) */
  status: "pending" | "approved" | "rejected";
  /** 거절 사유 */
  adminNote?: string;
  /** 검토자 사용자 ID */
  reviewedBy?: string;
  /** 검토 시간 */
  reviewedAt?: string;
  /** 승인된 작업공간 ID */
  approvedWorkspaceId?: string;

  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
}

/**
 * 작업공간 제안 폼 데이터
 */
export interface SuggestionFormData {
  /** 도시 ID */
  cityId: string;
  /** 이름 */
  name: string;
  /** 영문 이름 */
  nameEn?: string;
  /** 타입 */
  type: WorkspaceTypeEnum;
  /** 주소 */
  address: string;
  /** 설명 */
  description?: string;
  /** WiFi 속도 */
  wifiSpeed?: number;
  /** 콘센트 이용 가능 여부 */
  hasPower: boolean;
  /** 가격대 */
  priceRange?: PriceRangeType;
  /** 영업시간 */
  openingHours?: string;
  /** 전화번호 */
  phone?: string;
  /** 웹사이트 */
  website?: string;
  /** 위도 */
  latitude?: number;
  /** 경도 */
  longitude?: number;
  /** 이미지 파일 */
  image?: File;
}
