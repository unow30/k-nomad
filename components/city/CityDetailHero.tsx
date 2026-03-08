"use client";

import Image from "next/image";
import { City } from "@/types/city";
import LikeDislikeButtons from "./LikeDislikeButtons";
import { getRainfallIcon } from "@/lib/utils";

interface CityDetailHeroProps {
  city: City;
  initialUserLike?: boolean;
  initialUserDislike?: boolean;
}

/**
 * 도시 상세페이지 히어로 섹션
 * 도시명, 대표 이미지, 핵심 지표 4개 표시
 */
export default function CityDetailHero({
  city,
  initialUserLike = false,
  initialUserDislike = false,
}: CityDetailHeroProps) {
  return (
    <section className="relative w-full">
      {/* 배경 이미지 */}
      <div className="relative h-96 w-full overflow-hidden rounded-b-xl md:h-80">
        <Image
          src={city.image}
          alt={city.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 콘텐츠 오버레이 */}
      <div className="relative -mt-20 px-4 sm:px-6 md:px-8">
        <div className="mx-auto max-w-6xl">
          {/* 도시명 및 지역 정보 */}
          <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold md:text-4xl">
                🏙️ {city.name}
              </h1>
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                <span>📍</span>
                {city.province}
              </p>
              {city.description && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {city.description}
                </p>
              )}
            </div>

            {/* 핵심 지표 5개 (반응형) */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 sm:gap-4">
              {/* 종합점수 */}
              <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  종합점수
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  ⭐ {city.overallScore}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {city.reviewCount}개 리뷰
                </p>
              </div>

              {/* 월 생활비 */}
              <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  월 생활비
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  💵 {city.monthlyBudget}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  만원
                </p>
              </div>

              {/* 인터넷 속도 */}
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  인터넷 속도
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  📶 {city.internetSpeed}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mbps
                </p>
              </div>

              {/* 현재 기온 */}
              <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  현재 기온
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  🌡️ {city.currentWeather.temp}°
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  C
                </p>
              </div>

              {/* 강수량 */}
              <div className="rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  강수량
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {getRainfallIcon(city.currentWeather.rainfall)} {city.currentWeather.rainfall}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  mm
                </p>
              </div>
            </div>

            {/* 좋아요/싫어요 버튼 */}
            <div className="mt-6">
              <LikeDislikeButtons
                initialLikes={city.likes}
                initialDislikes={city.dislikes}
                cityId={city.id}
                cityName={city.name}
                initialUserLike={initialUserLike}
                initialUserDislike={initialUserDislike}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
