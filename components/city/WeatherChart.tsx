"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { City } from "@/types/city";

interface WeatherChartProps {
  city: City;
}

/**
 * 월별 날씨 정보 차트 (라인 차트)
 * 평균 기온, 최고 기온, 최저 기온 추이
 */
export default function WeatherChart({ city }: WeatherChartProps) {
  if (!city.monthlyWeather || city.monthlyWeather.length === 0) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl font-bold mb-6">🌡️ 월별 날씨</h2>
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
            날씨 정보가 없습니다.
          </div>
        </div>
      </section>
    );
  }

  const chartData = city.monthlyWeather.map((data) => ({
    ...data,
    name: `${data.month}월`,
  }));

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl font-bold mb-6">🌡️ 월별 날씨</h2>

        <div className="rounded-lg bg-muted p-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{ value: "기온 (°C)", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
                formatter={(value) => `${value}°C`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="maxTemp"
                stroke="#ef4444"
                name="최고 기온"
                strokeWidth={2}
                dot={true}
              />
              <Line
                type="monotone"
                dataKey="avgTemp"
                stroke="#f59e0b"
                name="평균 기온"
                strokeWidth={2}
                dot={true}
              />
              <Line
                type="monotone"
                dataKey="minTemp"
                stroke="#3b82f6"
                name="최저 기온"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 강수량 정보 */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">🌧️ 월별 강수량</h3>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {chartData.map((month) => (
              <div
                key={month.month}
                className="rounded-lg border border-muted-foreground/10 p-3 text-center"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  {month.name}
                </p>
                <p className="text-lg font-bold mt-1">{month.rainfall}mm</p>
                {month.rainfall > 100 && (
                  <p className="text-xs text-blue-600 mt-1">☔ 많음</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
