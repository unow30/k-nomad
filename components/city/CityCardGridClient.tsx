"use client";

import { City } from "@/types/city";
import CityCard from "./CityCard";

interface CityCardGridClientProps {
  cities: City[];
}

/**
 * 도시 카드 그리드 (클라이언트 컴포넌트 버전)
 * 더보기 기능 등에서 사용
 * reactions 조회 없이 기본값으로 렌더링
 */
export default function CityCardGridClient({ cities }: CityCardGridClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cities.map((city) => (
        <CityCard
          key={city.id}
          city={city}
          initialUserLike={false}
          initialUserDislike={false}
        />
      ))}
    </div>
  );
}
