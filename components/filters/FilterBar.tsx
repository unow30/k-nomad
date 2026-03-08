"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Grid, Map, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  REGIONS,
  BUDGET_OPTIONS,
  ENVIRONMENT_OPTIONS,
  SEASON_OPTIONS,
} from "@/types/city";

interface FilterBarProps {
  initialSort?: string;
  initialRegion?: string;
  initialBudget?: string;
  initialSearch?: string;
  initialEnvironment?: string;
  initialSeason?: string;
}

const SORT_OPTIONS = [
  { value: "score", label: "종합점수순" },
  { value: "budget-low", label: "생활비 낮은순" },
  { value: "budget-high", label: "생활비 높은순" },
  { value: "internet", label: "인터넷 빠른순" },
  { value: "reviews", label: "리뷰 많은순" },
];

/**
 * 필터 바 컴포넌트
 * URL 쿼리 파라미터와 동기화
 */
export default function FilterBar({
  initialSort = "score",
  initialRegion = "all",
  initialBudget = "all",
  initialSearch = "",
  initialEnvironment = "all",
  initialSeason = "all",
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 각 필터의 상태 관리
  const [search, setSearch] = useState<string>(initialSearch);
  const [sort, setSort] = useState<string>(initialSort);
  const [region, setRegion] = useState<string>(initialRegion);
  const [budget, setBudget] = useState<string>(initialBudget);
  const [environment, setEnvironment] = useState<string>(initialEnvironment);
  const [season, setSeason] = useState<string>(initialSeason);

  // URL 쿼리 업데이트
  const updateQuery = (updates: Record<string, string | undefined>) => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });

      router.push(`/?${newParams.toString()}`);
    });
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    updateQuery({ sort: value });
  };

  const handleRegionChange = (value: string) => {
    setRegion(value);
    updateQuery({ region: value });
  };

  const handleBudgetChange = (value: string) => {
    setBudget(value);
    updateQuery({ budget: value === "all" ? undefined : value });
  };

  const handleEnvironmentChange = (value: string) => {
    setEnvironment(value);
    updateQuery({ environment: value === "all" ? undefined : value });
  };

  const handleSeasonChange = (value: string) => {
    setSeason(value);
    updateQuery({ season: value === "all" ? undefined : value });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateQuery({ search: search.trim() || undefined });
  };

  return (
    <div className="border-b bg-white/95 backdrop-blur-sm sticky top-[64px] z-40 py-4 shadow-sm">
      <div className="container mx-auto px-4">
        {/* 검색 바 */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="도시 이름으로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              disabled={isPending}
            />
          </div>
        </form>

        {/* 필터 옵션 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 정렬 필터 */}
          <div className="w-full sm:w-auto">
            <label className="text-xs text-muted-foreground mb-1 block">정렬</label>
            <Select value={sort} onValueChange={handleSortChange} disabled={isPending}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="정렬 선택" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 지역 필터 */}
          <div className="w-full sm:w-auto">
            <label className="text-xs text-muted-foreground mb-1 block">지역</label>
            <Select value={region} onValueChange={handleRegionChange} disabled={isPending}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="지역 선택" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 예산 필터 */}
          <div className="w-full sm:w-auto">
            <label className="text-xs text-muted-foreground mb-1 block">월 생활비</label>
            <Select value={budget} onValueChange={handleBudgetChange} disabled={isPending}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="예산 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {BUDGET_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 환경 필터 */}
          <div className="w-full sm:w-auto">
            <label className="text-xs text-muted-foreground mb-1 block">환경 특성</label>
            <Select value={environment} onValueChange={handleEnvironmentChange} disabled={isPending}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="환경 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {ENVIRONMENT_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 최고계절 필터 */}
          <div className="w-full sm:w-auto">
            <label className="text-xs text-muted-foreground mb-1 block">최고 계절</label>
            <Select value={season} onValueChange={handleSeasonChange} disabled={isPending}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="계절 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {SEASON_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Spacer */}
          <div className="flex-1 hidden md:block" />

          {/* 뷰 전환 버튼 (데스크톱만) */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" disabled>
              <Map className="h-4 w-4" />
              <span className="sr-only">지도 뷰</span>
            </Button>
            <Button variant="default" size="icon">
              <Grid className="h-4 w-4" />
              <span className="sr-only">그리드 뷰</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
