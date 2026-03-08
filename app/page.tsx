import { Suspense } from "react";
import HeroSection from "@/components/layout/HeroSection";
import FilterBar from "@/components/filters/FilterBar";
import CityListSection from "@/components/city/CityListSection";
import { getCitiesList } from "@/lib/queries/cities";
import { createClient } from "@/utils/supabase/server";
import { City } from "@/types/city";

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * 홈페이지 (동적 렌더링)
 * API로 도시 목록 조회, 필터/정렬 적용
 */
export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const sort = (params.sort as string) || "score";
  const region = (params.region as string) || "all";
  const budget = (params.budget as string) || undefined;
  const search = (params.search as string) || "";
  const environment = (params.environment as string) || undefined;
  const season = (params.season as string) || undefined;
  const limit = 12;
  const offset = 0;

  const result = await getCitiesList(supabase, {
    sort,
    region,
    budget,
    search,
    environment,
    season,
    limit,
    offset,
  });

  return (
    <>
      {/* 히어로 섹션 */}
      <HeroSection />

      {/* 필터 바 */}
      <FilterBar
        initialSort={sort}
        initialRegion={region}
        initialBudget={budget}
        initialSearch={search}
        initialEnvironment={environment || "all"}
        initialSeason={season || "all"}
      />

      {/* 도시 카드 그리드 */}
      <section className="container mx-auto px-4 py-8">
        <Suspense fallback={<CityGridSkeleton />}>
          <CityListSection
            key={`${sort}-${region}-${budget ?? ""}-${search}-${environment ?? ""}-${season ?? ""}`}
            initialCities={result.data as City[]}
            total={result.total}
            filters={{ sort, region, budget, search, environment, season }}
          />
        </Suspense>
      </section>
    </>
  );
}

// 로딩 스켈레톤
function CityGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="h-64 rounded-lg bg-muted/50 animate-pulse"
        />
      ))}
    </div>
  );
}
