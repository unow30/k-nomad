import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace, WorkspaceTypeEnum } from "@/types/workspace";
import { Coffee, Building2, Wifi, Plug, Star, MapPin, Clock, Library, Hotel } from "lucide-react";

interface WorkspaceCardProps {
  workspace: Workspace;
  /** 클릭 시 상세 페이지로 이동할지 여부 */
  interactive?: boolean;
}

/**
 * 작업 공간 카드 컴포넌트
 * 카페, 코워킹 스페이스, 도서관 등의 정보를 표시
 */
export default function WorkspaceCard({ workspace, interactive = true }: WorkspaceCardProps) {
  const typeConfig = getWorkspaceTypeConfig(workspace.type);

  const cardContent = (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
      <CardContent className="p-4">
        {/* 헤더: 이름, 평점, 타입 아이콘 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {typeConfig.icon}
            <h4 className="font-semibold text-base">{workspace.name}</h4>
          </div>
          {workspace.averageRating > 0 && (
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{workspace.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* 주소 */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">{workspace.address}</span>
        </div>

        {/* 태그/특징 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* 가격대 배지 */}
          <Badge variant="outline" className={getPriceRangeColor(workspace.priceRange)}>
            {getPriceRangeLabel(workspace.priceRange)}
          </Badge>

          {/* 콘센트 */}
          {workspace.hasPower && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
              <Plug className="w-3 h-3" />
              콘센트
            </span>
          )}

          {/* WiFi 속도 */}
          {workspace.wifiSpeed && workspace.wifiSpeed > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
              <Wifi className="w-3 h-3" />
              {workspace.wifiSpeed}Mbps
            </span>
          )}
        </div>

        {/* 영업시간 */}
        {workspace.openingHours && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{workspace.openingHours}</span>
          </div>
        )}

        {/* 리뷰 개수 */}
        {workspace.reviewCount > 0 && (
          <div className="mt-4 text-xs text-muted-foreground">
            💬 리뷰 {workspace.reviewCount}개
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!interactive) {
    return cardContent;
  }

  return (
    <Link href={`/workspace/${workspace.id}`} className="block h-full">
      {cardContent}
    </Link>
  );
}

/**
 * 작업 공간 타입별 설정 (아이콘, 색상)
 */
function getWorkspaceTypeConfig(type: WorkspaceTypeEnum) {
  switch (type) {
    case "cafe":
      return {
        icon: <Coffee className="w-5 h-5 text-amber-600" />,
        label: "카페",
        color: "text-amber-600",
      };
    case "coworking":
      return {
        icon: <Building2 className="w-5 h-5 text-blue-600" />,
        label: "코워킹 스페이스",
        color: "text-blue-600",
      };
    case "library":
      return {
        icon: <Library className="w-5 h-5 text-purple-600" />,
        label: "도서관",
        color: "text-purple-600",
      };
    case "hotel_lobby":
      return {
        icon: <Hotel className="w-5 h-5 text-pink-600" />,
        label: "호텔 로비",
        color: "text-pink-600",
      };
    default:
      return {
        icon: <MapPin className="w-5 h-5 text-gray-600" />,
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
