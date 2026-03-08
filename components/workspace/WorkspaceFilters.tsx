"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkspaceTypeEnum, WORKSPACE_TYPE_OPTIONS, PRICE_RANGE_OPTIONS, WORKSPACE_SORT_OPTIONS } from "@/types/workspace";

interface WorkspaceFiltersProps {
  selectedType: WorkspaceTypeEnum | "all";
  selectedPriceRange: string;
  sortBy: string;
  onTypeChange: (type: WorkspaceTypeEnum | "all") => void;
  onPriceRangeChange: (priceRange: string) => void;
  onSortChange: (sort: string) => void;
}

/**
 * 작업 공간 필터 및 정렬 컴포넌트
 */
export default function WorkspaceFilters({
  selectedType,
  selectedPriceRange,
  sortBy,
  onTypeChange,
  onPriceRangeChange,
  onSortChange,
}: WorkspaceFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-4">
      {/* 타입 필터 */}
      <div className="flex-1 min-w-[150px]">
        <label className="text-sm font-medium mb-2 block">타입</label>
        <Select value={selectedType} onValueChange={(value) => onTypeChange(value as WorkspaceTypeEnum | "all")}>
          <SelectTrigger>
            <SelectValue placeholder="타입 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {WORKSPACE_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 가격대 필터 */}
      <div className="flex-1 min-w-[150px]">
        <label className="text-sm font-medium mb-2 block">가격대</label>
        <Select value={selectedPriceRange} onValueChange={onPriceRangeChange}>
          <SelectTrigger>
            <SelectValue placeholder="가격대 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {PRICE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 정렬 */}
      <div className="flex-1 min-w-[150px]">
        <label className="text-sm font-medium mb-2 block">정렬</label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            {WORKSPACE_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
