/**
 * 월별 날씨 데이터 조회 함수
 * Supabase monthly_weather 테이블에서 데이터를 가져옵니다.
 */

import { createClient } from "@/utils/supabase/server";
import { MonthlyWeather } from "@/types/city";

/**
 * 특정 도시의 월별 날씨 데이터를 조회합니다.
 * @param cityId - 도시 ID (UUID)
 * @returns 12개월 날씨 데이터 배열 (1월~12월 순서)
 */
export async function getMonthlyWeather(
  cityId: string
): Promise<MonthlyWeather[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("monthly_weather")
    .select("month, avg_temp, max_temp, min_temp, rainfall")
    .eq("city_id", cityId)
    .order("month", { ascending: true });

  if (error) {
    console.error("월별 날씨 데이터 조회 실패:", error);
    return [];
  }

  if (!data || data.length === 0) {
    console.warn(`도시 ID ${cityId}에 대한 날씨 데이터가 없습니다.`);
    return [];
  }

  // DB 데이터를 MonthlyWeather 타입으로 변환
  return data.map((row) => ({
    month: row.month,
    avgTemp: row.avg_temp,
    maxTemp: row.max_temp,
    minTemp: row.min_temp,
    rainfall: row.rainfall,
  }));
}

/**
 * 도시 이름으로 월별 날씨 데이터를 조회합니다.
 * @param cityName - 도시 이름 (예: "제주시", "부산")
 * @returns 12개월 날씨 데이터 배열 (1월~12월 순서)
 */
export async function getMonthlyWeatherByCityName(
  cityName: string
): Promise<MonthlyWeather[]> {
  const supabase = await createClient();

  // 먼저 도시 ID를 조회
  const { data: cityData, error: cityError } = await supabase
    .from("cities")
    .select("id")
    .eq("name", cityName)
    .single();

  if (cityError || !cityData) {
    console.error(`도시 "${cityName}" 조회 실패:`, cityError);
    return [];
  }

  // 도시 ID로 날씨 데이터 조회
  return getMonthlyWeather(cityData.id);
}
