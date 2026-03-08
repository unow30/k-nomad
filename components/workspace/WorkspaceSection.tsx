"use client";

import { useState, useEffect } from "react";
import { Workspace, WorkspaceTypeEnum, WORKSPACE_TYPE_OPTIONS } from "@/types/workspace";
import WorkspaceCard from "./WorkspaceCard";
import WorkspaceFilters from "./WorkspaceFilters";
import { Coffee, Building2, Library, Hotel, Loader2 } from "lucide-react";

interface WorkspaceSectionProps {
  cityId: string;
  citySlug: string;
  cityName: string;
}

/**
 * 작업 공간 섹션 컴포넌트
 * 도시별 작업 공간 목록을 API에서 가져와 표시
 */
export default function WorkspaceSection({ cityId, citySlug, cityName }: WorkspaceSectionProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalWorkspaces, setTotalWorkspaces] = useState(0); // 초기 전체 작업공간 수

  // 필터 상태
  const [selectedType, setSelectedType] = useState<WorkspaceTypeEnum | "all">("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | "all">("all");
  const [sortBy, setSortBy] = useState<string>("rating");

  // 작업 공간 데이터 로드
  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (selectedType !== "all") params.append("type", selectedType);
        if (selectedPriceRange !== "all") params.append("priceRange", selectedPriceRange);
        params.append("sort", sortBy);

        const response = await fetch(`/api/cities/${citySlug}/workspaces?${params.toString()}`);

        if (!response.ok) {
          throw new Error("작업 공간 정보를 불러올 수 없습니다");
        }

        const result = await response.json();
        const data = result.data || [];
        setWorkspaces(data);
        setFilteredWorkspaces(data);

        // 필터가 전체("all")일 때만 총 개수 업데이트
        if (selectedType === "all" && selectedPriceRange === "all") {
          setTotalWorkspaces(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch workspaces:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspaces();
  }, [citySlug, selectedType, selectedPriceRange, sortBy]);

  // 타입별 그룹화
  const groupedWorkspaces = groupByType(filteredWorkspaces);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">☕ {cityName} 작업공간</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">☕ {cityName} 작업공간</h2>
        <div className="rounded-lg border border-destructive/30 p-8 text-center text-destructive">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  // 초기 데이터가 전혀 없는 경우
  if (totalWorkspaces === 0 && !loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">☕ {cityName} 작업공간</h2>
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
          <Coffee className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>작업공간 정보가 준비 중입니다.</p>
          <p className="text-sm mt-2">곧 카페 및 코워킹 스페이스 정보가 추가될 예정입니다.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-2">☕ {cityName} 작업공간</h2>
      <p className="text-muted-foreground mb-6">
        노마드들이 추천하는 카페 및 코워킹 스페이스 ({totalWorkspaces}개)
      </p>

      {/* 필터 - 항상 표시 */}
      <WorkspaceFilters
        selectedType={selectedType}
        selectedPriceRange={selectedPriceRange}
        sortBy={sortBy}
        onTypeChange={setSelectedType}
        onPriceRangeChange={setSelectedPriceRange}
        onSortChange={setSortBy}
      />

      {/* 필터 결과가 없는 경우 */}
      {workspaces.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
          <Coffee className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>선택한 조건에 맞는 작업공간이 없습니다.</p>
          <p className="text-sm mt-2">다른 필터 조건을 선택해보세요.</p>
        </div>
      ) : (
        /* 타입별 그룹 표시 */
        <div className="space-y-8">
          {groupedWorkspaces.cafes.length > 0 && (
            <WorkspaceTypeGroup
              icon={<Coffee className="w-5 h-5 text-amber-600" />}
              title="카페"
              count={groupedWorkspaces.cafes.length}
              workspaces={groupedWorkspaces.cafes}
            />
          )}

          {groupedWorkspaces.coworkings.length > 0 && (
            <WorkspaceTypeGroup
              icon={<Building2 className="w-5 h-5 text-blue-600" />}
              title="코워킹 스페이스"
              count={groupedWorkspaces.coworkings.length}
              workspaces={groupedWorkspaces.coworkings}
            />
          )}

          {groupedWorkspaces.libraries.length > 0 && (
            <WorkspaceTypeGroup
              icon={<Library className="w-5 h-5 text-purple-600" />}
              title="도서관"
              count={groupedWorkspaces.libraries.length}
              workspaces={groupedWorkspaces.libraries}
            />
          )}

          {groupedWorkspaces.others.length > 0 && (
            <WorkspaceTypeGroup
              icon={<Hotel className="w-5 h-5 text-pink-600" />}
              title="기타"
              count={groupedWorkspaces.others.length}
              workspaces={groupedWorkspaces.others}
            />
          )}
        </div>
      )}
    </section>
  );
}

/**
 * 작업 공간 타입별 그룹 컴포넌트
 */
function WorkspaceTypeGroup({
  icon,
  title,
  count,
  workspaces,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  workspaces: Workspace[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold">
          {title} ({count})
        </h3>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((workspace) => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </div>
    </div>
  );
}

/**
 * 작업 공간을 타입별로 그룹화
 */
function groupByType(workspaces: Workspace[]) {
  return {
    cafes: workspaces.filter((ws) => ws.type === "cafe"),
    coworkings: workspaces.filter((ws) => ws.type === "coworking"),
    libraries: workspaces.filter((ws) => ws.type === "library"),
    others: workspaces.filter(
      (ws) => ws.type !== "cafe" && ws.type !== "coworking" && ws.type !== "library"
    ),
  };
}
