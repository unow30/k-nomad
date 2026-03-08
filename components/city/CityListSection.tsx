"use client";

import { useState } from "react";
import { City } from "@/types/city";
import CityCardGridClient from "./CityCardGridClient";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CityListSectionProps {
  initialCities: City[];
  total: number;
  filters: {
    sort: string;
    region: string;
    budget?: string;
    search?: string;
    environment?: string;
    season?: string;
  };
}

/**
 * 도시 목록 섹션 (클라이언트 컴포넌트)
 * 더보기 버튼으로 추가 도시 로드
 */
export default function CityListSection({
  initialCities,
  total,
  filters,
}: CityListSectionProps) {
  const [cities, setCities] = useState<City[]>(initialCities);
  const [offset, setOffset] = useState(12);
  const [loading, setLoading] = useState(false);
  const hasMore = cities.length < total;

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // 필터 파라미터를 쿼리스트링으로 변환
      const params = new URLSearchParams({
        sort: filters.sort,
        region: filters.region,
        limit: "12",
        offset: offset.toString(),
      });

      if (filters.budget) params.append("budget", filters.budget);
      if (filters.search) params.append("search", filters.search);
      if (filters.environment) params.append("environment", filters.environment);
      if (filters.season) params.append("season", filters.season);

      const response = await fetch(`/api/cities?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load more cities");
      }

      const result = await response.json();
      setCities((prev) => [...prev, ...result.data]);
      setOffset((prev) => prev + 12);
    } catch (error) {
      console.error("Error loading more cities:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CityCardGridClient cities={cities} />

      {hasMore && (
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로딩 중...
              </>
            ) : (
              "더 보기 ▼"
            )}
          </Button>
        </div>
      )}
    </>
  );
}
