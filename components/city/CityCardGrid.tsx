import { City } from "@/types/city";
import CityCard from "./CityCard";
import { getCityReactions } from "@/app/actions/city-reactions";

interface CityCardGridProps {
  cities: City[];
  limit?: number;
}

/**
 * 도시 카드 그리드 컴포넌트
 * PRD 섹션 5.6 참고
 * 반응형: 데스크톱 3열, 태블릿 2열, 모바일 1열
 */
export default async function CityCardGrid({ cities, limit = 12 }: CityCardGridProps) {
  const displayCities = cities.slice(0, limit);

  // 사용자의 모든 도시 반응 조회 (한 번의 쿼리로)
  const cityIds = displayCities.map((city) => city.id);
  const reactions = await getCityReactions(cityIds);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayCities.map((city) => {
        const reaction = reactions.get(city.id);
        return (
          <CityCard
            key={city.id}
            city={city}
            initialUserLike={reaction?.city_like || false}
            initialUserDislike={reaction?.city_dislike || false}
          />
        );
      })}
    </div>
  );
}
