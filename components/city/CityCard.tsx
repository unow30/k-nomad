import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { City } from "@/types/city";
import {
  cn,
  formatKoreanNumber,
  getAQIColor,
  getBudgetLabel,
  getEnvironmentLabel,
  getSeasonLabel,
  getSeasonEmoji,
  getRainfallIcon,
} from "@/lib/utils";
import LikeDislikeButtons from "./LikeDislikeButtons";

interface CityCardProps {
  city: City;
  initialUserLike?: boolean;
  initialUserDislike?: boolean;
}

/**
 * 도시 카드 컴포넌트 (컴팩트 버전)
 * PRD 섹션 5.2.3, UI 문서 섹션 3 참고
 */
export default function CityCard({
  city,
  initialUserLike = false,
  initialUserDislike = false
}: CityCardProps) {
  return (
    <Link href={`/city/${city.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
      {/* 도시 이미지 */}
      <div className="relative h-48 w-full">
        <Image
          src={city.image}
          alt={city.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* 순위 배지 */}
        <Badge
          className="absolute top-2 left-2 bg-black/70 hover:bg-black/70 text-white"
          variant="secondary"
        >
          #{city.rank}
        </Badge>
        {/* 인터넷 속도 배지 */}
        <Badge
          className="absolute top-2 right-2 bg-black/70 hover:bg-black/70 text-white"
          variant="secondary"
        >
          📶 {city.internetSpeed}M
        </Badge>
      </div>

      <CardContent className="p-4">
        {/* 도시명 및 지역 */}
        <div className="mb-3">
          <h3 className="font-bold text-lg flex items-center gap-1">
            <span>🏙️</span>
            {city.name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span>📍</span>
            {city.province}
          </p>
        </div>

        {/* 주요 지표 1 */}
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground flex items-center gap-1">
            <span>💵</span>
            {formatKoreanNumber(city.monthlyBudget * 10000)}원
          </span>
          <span className="text-muted-foreground flex items-center gap-1">
            <span>🏠</span>
            {city.rentStudio}만
          </span>
        </div>

        {/* 주요 지표 2 */}
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-muted-foreground flex items-center gap-1">
            <span>🌡️</span>
            {city.currentWeather.temp}°C
          </span>
          <span className={cn("flex items-center gap-1", getAQIColor(city.currentWeather.aqi))}>
            <span>😷</span>
            {city.currentWeather.aqi} {city.currentWeather.aqiLabel}
          </span>
        </div>

        {/* 강수량 */}
        <div className="text-sm mb-3 text-muted-foreground flex items-center gap-1">
          <span>{getRainfallIcon(city.currentWeather.rainfall)}</span>
          {city.currentWeather.rainfall}mm
        </div>

        {/* 필터 정보 (예산, 환경, 최고계절) */}
        {(city.budget || city.environment || city.bestSeason) && (
          <div className="border-t pt-3 mb-3 space-y-2">
            {city.budget && (
              <div className="flex items-center gap-2 text-sm">
                <span>💰</span>
                <span className="text-muted-foreground">
                  예산: <span className="font-medium text-foreground">{getBudgetLabel(city.budget)}</span>
                </span>
              </div>
            )}
            {city.environment && city.environment.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span>🌳</span>
                <span className="text-muted-foreground">
                  환경: <span className="font-medium text-foreground">{city.environment.map(getEnvironmentLabel).join(", ")}</span>
                </span>
              </div>
            )}
            {city.bestSeason && (
              <div className="flex items-center gap-2 text-sm">
                <span>{getSeasonEmoji(city.bestSeason)}</span>
                <span className="text-muted-foreground">
                  최고계절: <span className="font-medium text-foreground">{getSeasonLabel(city.bestSeason)}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* 좋아요/싫어요 */}
        <LikeDislikeButtons
          initialLikes={city.likes}
          initialDislikes={city.dislikes}
          cityId={city.id}
          cityName={city.name}
          initialUserLike={initialUserLike}
          initialUserDislike={initialUserDislike}
        />
      </CardContent>
    </Card>
    </Link>
  );
}
