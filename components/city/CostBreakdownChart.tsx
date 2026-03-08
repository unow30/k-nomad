"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { City } from "@/types/city";

interface CostBreakdownChartProps {
  city: City;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

/**
 * 생활비 항목별 분석 차트 (파이 차트)
 * 주거, 식비, 교통, 여가 항목별 지출 비율 표시
 */
export default function CostBreakdownChart({ city }: CostBreakdownChartProps) {
  const chartData = useMemo(() => {
    if (!city.costBreakdown) {
      return [];
    }

    return [
      {
        name: "주거비",
        value: city.costBreakdown.housing,
        emoji: "🏠",
      },
      {
        name: "식비",
        value: city.costBreakdown.food,
        emoji: "🍽️",
      },
      {
        name: "교통비",
        value: city.costBreakdown.transport,
        emoji: "🚗",
      },
      {
        name: "여가/문화",
        value: city.costBreakdown.leisure,
        emoji: "🎭",
      },
    ];
  }, [city.costBreakdown]);

  const totalBudget = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  if (!city.costBreakdown || chartData.length === 0) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl font-bold mb-6">💰 생활비 분석</h2>
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
            생활비 정보가 없습니다.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl font-bold mb-2">💰 생활비 분석</h2>
        <p className="text-muted-foreground mb-6">
          월간 예상 생활비: <span className="font-bold text-foreground">{totalBudget}만원</span>
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 차트 영역 */}
          <div className="flex items-center justify-center rounded-lg bg-muted p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}만원`}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 상세 정보 영역 */}
          <div className="space-y-4">
            {chartData.map((item, index) => (
              <div
                key={item.name}
                className="rounded-lg border border-muted-foreground/10 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{item.value}만원</span>
                  <span className="text-sm text-muted-foreground">
                    {((item.value / totalBudget) * 100).toFixed(1)}%
                  </span>
                </div>
                {/* 프로그레스 바 */}
                <div className="mt-2 h-2 rounded-full bg-muted-foreground/10 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${(item.value / totalBudget) * 100}%`,
                      backgroundColor: COLORS[index],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}