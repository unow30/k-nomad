import Image from "next/image";
import { Workspace, WorkspaceTypeEnum } from "@/types/workspace";
import { Badge } from "@/components/ui/badge";
import {
  Coffee,
  Building2,
  Wifi,
  Plug,
  Star,
  MapPin,
  Clock,
  Library,
  Hotel,
  Phone,
  Globe
} from "lucide-react";

interface WorkspaceDetailHeroProps {
  workspace: Workspace;
}

/**
 * 작업공간 상세페이지 히어로 섹션
 * 작업공간명, 타입 아이콘, 핵심 정보 표시
 */
export default function WorkspaceDetailHero({ workspace }: WorkspaceDetailHeroProps) {
  const typeConfig = getWorkspaceTypeConfig(workspace.type);

  return (
    <section className="relative w-full">
      {/* 배경 이미지 (있는 경우) */}
      {workspace.imageUrl && (
        <div className="relative h-64 w-full overflow-hidden rounded-b-xl md:h-80">
          <Image
            src={workspace.imageUrl}
            alt={workspace.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* 어두운 오버레이 */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* 콘텐츠 오버레이 */}
      <div className={workspace.imageUrl ? "relative -mt-20 px-4 sm:px-6 md:px-8" : "px-4 sm:px-6 md:px-8 mt-6"}>
        <div className="mx-auto max-w-6xl">
          {/* 작업공간명 및 기본 정보 */}
          <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-2">
              {/* 타입 아이콘 + 이름 */}
              <div className="flex items-center gap-3">
                {typeConfig.icon}
                <h1 className="text-3xl font-bold md:text-4xl">
                  {workspace.name}
                </h1>
              </div>

              {/* 영문 이름 */}
              {workspace.nameEn && (
                <p className="text-lg text-muted-foreground">
                  {workspace.nameEn}
                </p>
              )}

              {/* 주소 */}
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {workspace.address}
              </p>

              {/* 평점 및 리뷰 개수 */}
              {workspace.averageRating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-lg font-bold">{workspace.averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({workspace.reviewCount}개 리뷰)
                  </span>
                </div>
              )}

              {/* 설명 */}
              {workspace.description && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {workspace.description}
                </p>
              )}
            </div>

            {/* 핵심 정보 그리드 */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {/* 가격대 */}
              <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  가격대
                </p>
                <Badge variant="outline" className={getPriceRangeColor(workspace.priceRange)}>
                  {getPriceRangeLabel(workspace.priceRange)}
                </Badge>
              </div>

              {/* WiFi 속도 */}
              {workspace.wifiSpeed && workspace.wifiSpeed > 0 && (
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    WiFi 속도
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                    <Wifi className="w-5 h-5" />
                    {workspace.wifiSpeed}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mbps
                  </p>
                </div>
              )}

              {/* 콘센트 */}
              <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  콘센트
                </p>
                <p className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <Plug className="w-5 h-5" />
                  {workspace.hasPower ? "있음" : "제한적"}
                </p>
              </div>

              {/* 영업시간 */}
              {workspace.openingHours && (
                <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    영업시간
                  </p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {workspace.openingHours}
                  </p>
                </div>
              )}
            </div>

            {/* 연락처 정보 */}
            {(workspace.phone) && (
              <div className="mt-6 flex flex-wrap gap-4">
                {workspace.phone && (
                  <a
                    href={`tel:${workspace.phone}`}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {workspace.phone}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 작업 공간 타입별 설정 (아이콘, 색상)
 */
function getWorkspaceTypeConfig(type: WorkspaceTypeEnum) {
  switch (type) {
    case "cafe":
      return {
        icon: <Coffee className="w-8 h-8 text-amber-600" />,
        label: "카페",
        color: "text-amber-600",
      };
    case "coworking":
      return {
        icon: <Building2 className="w-8 h-8 text-blue-600" />,
        label: "코워킹 스페이스",
        color: "text-blue-600",
      };
    case "library":
      return {
        icon: <Library className="w-8 h-8 text-purple-600" />,
        label: "도서관",
        color: "text-purple-600",
      };
    case "hotel_lobby":
      return {
        icon: <Hotel className="w-8 h-8 text-pink-600" />,
        label: "호텔 로비",
        color: "text-pink-600",
      };
    default:
      return {
        icon: <MapPin className="w-8 h-8 text-gray-600" />,
        label: "기타",
        color: "text-gray-600",
      };
  }
}

/**
 * 가격대 레이블
 */
function getPriceRangeLabel(priceRange: string): string {
  switch (priceRange) {
    case "free":
      return "무료";
    case "low":
      return "저렴";
    case "medium":
      return "보통";
    case "high":
      return "고가";
    default:
      return priceRange;
  }
}

/**
 * 가격대 색상
 */
function getPriceRangeColor(priceRange: string): string {
  switch (priceRange) {
    case "free":
      return "border-green-300 text-green-700 bg-green-50";
    case "low":
      return "border-blue-300 text-blue-700 bg-blue-50";
    case "medium":
      return "border-orange-300 text-orange-700 bg-orange-50";
    case "high":
      return "border-red-300 text-red-700 bg-red-50";
    default:
      return "";
  }
}
