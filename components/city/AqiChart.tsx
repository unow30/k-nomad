"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { City } from "@/types/city";

interface AqiChartProps {
  city: City;
}

/**
 * AQI 라벨에 따른 색상 코딩
 */
function getAqiBarColor(aqi: number): string {
  if (aqi <= 50) return "#10b981"; // 좋음 (초록)
  if (aqi <= 100) return "#f59e0b"; // 보통 (주황)
  if (aqi <= 150) return "#ef4444"; // 나쁨 (빨강)
  return "#8b5cf6"; // 매우나쁨 (보라)
}

/**
 * AQI 라벨
 */
function getAqiLabel(aqi: number): string {
  if (aqi <= 50) return "좋음";
  if (aqi <= 100) return "보통";
  if (aqi <= 150) return "나쁨";
  return "매우나쁨";
}

/**
 * 월별 미세먼지 (AQI) 차트 (막대 차트)
 */
export default function AqiChart({ city }: AqiChartProps) {
  if (!city.monthlyAqi || city.monthlyAqi.length === 0) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl font-bold mb-6">😷 월별 미세먼지 (AQI)</h2>
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
            미세먼지 정보가 없습니다.
          </div>
        </div>
      </section>
    );
  }

  const chartData = city.monthlyAqi.map((data) => ({
    ...data,
    name: `${data.month}월`,
  }));

  // 연간 평균 AQI
  const avgAqi = Math.round(
    chartData.reduce((sum, item) => sum + item.aqi, 0) / chartData.length
  );

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl font-bold mb-2">😷 월별 미세먼지 (AQI)</h2>
        <p className="text-muted-foreground mb-6">
          연간 평균 AQI: <span className="font-bold text-foreground">{avgAqi}</span> ({getAqiLabel(avgAqi)})
        </p>

        <div className="rounded-lg bg-muted p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{ value: "AQI", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                formatter={(value) => [value, "AQI"]}
              />
              <Bar dataKey="aqi" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getAqiBarColor(entry.aqi)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AQI 범위 설명 */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-green-50 p-3 border border-green-200">
            <p className="text-sm font-medium text-green-900">좋음</p>
            <p className="text-xs text-green-700 mt-1">0-50</p>
          </div>
          <div className="rounded-lg bg-yellow-50 p-3 border border-yellow-200">
            <p className="text-sm font-medium text-yellow-900">보통</p>
            <p className="text-xs text-yellow-700 mt-1">51-100</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3 border border-red-200">
            <p className="text-sm font-medium text-red-900">나쁨</p>
            <p className="text-xs text-red-700 mt-1">101-150</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3 border border-purple-200">
            <p className="text-sm font-medium text-purple-900">매우나쁨</p>
            <p className="text-xs text-purple-700 mt-1">150+</p>
          </div>
        </div>
      </div>
    </section>
  );
}
