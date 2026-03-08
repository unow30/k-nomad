import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { City, AqiLabelType, RegionType, EnvironmentType, SeasonType, MonthlyWeather } from "@/types/city";

// ============================
// 데이터 변환 함수
// ============================

/**
 * 데이터베이스 도시 데이터를 City 타입으로 변환
 * city_metrics 데이터가 있으면 우선 사용 (더 최신 데이터)
 */
export function convertDatabaseCityToCity(dbCity: any): City {
  // city_metrics가 배열로 올 경우 첫 번째 항목 사용
  const metrics = Array.isArray(dbCity.city_metrics)
    ? dbCity.city_metrics[0]
    : dbCity.city_metrics;

  // current_weather JSONB 우선 사용, 없으면 legacy 필드 fallback
  let currentWeather;
  if (metrics?.current_weather) {
    currentWeather = {
      temp: Number(metrics.current_weather.temp),
      aqi: Number(metrics.current_weather.aqi),
      aqiLabel: metrics.current_weather.aqi_label as AqiLabelType,
      rainfall: Number(metrics.current_weather.rainfall),
    };
  } else {
    // Fallback: legacy 필드 사용
    currentWeather = {
      temp: metrics?.current_temp ?? dbCity.current_temp ?? 15,
      aqi: metrics?.aqi ?? dbCity.aqi ?? 50,
      aqiLabel: (metrics?.aqi_label ?? dbCity.aqi_label ?? "보통") as AqiLabelType,
      rainfall: 0,
    };
  }

  // city_metrics가 있으면 우선 사용, 없으면 cities 테이블 데이터 사용
  const monthlyBudget = metrics?.monthly_budget ?? dbCity.monthly_budget ?? 0;
  const rentStudio = metrics?.rent_studio ?? dbCity.rent_studio ?? 0;
  const internetSpeed = metrics?.internet_speed ?? dbCity.internet_speed ?? 0;

  // monthly_weather 데이터 변환 (DB에서 조회한 경우)
  const monthlyWeather = dbCity.monthly_weather
    ? dbCity.monthly_weather
        .map((w: any) => ({
          month: w.month,
          avgTemp: w.avg_temp,
          maxTemp: w.max_temp,
          minTemp: w.min_temp,
          rainfall: w.rainfall,
        }))
        .sort((a: MonthlyWeather, b: MonthlyWeather) => a.month - b.month)
    : undefined;

  return {
    id: dbCity.id,
    rank: dbCity.rank,
    name: dbCity.name,
    region: dbCity.region as RegionType,
    province: dbCity.province,
    image: dbCity.image_url || "",
    overallScore: dbCity.overall_score || 0,
    reviewCount: dbCity.review_count || 0,
    monthlyBudget,
    rentStudio,
    internetSpeed,

    // 현재 날씨 정보
    currentWeather,

    cafeCount: dbCity.cafe_count || 0,
    ktxTime: dbCity.ktx_time || 0,
    likes: dbCity.likes || 0,
    dislikes: dbCity.dislikes || 0,
    tags: dbCity.tags || [],
    budget: monthlyBudget
      ? monthlyBudget <= 100
        ? "under100"
        : monthlyBudget <= 200
        ? "100to200"
        : "over200"
      : undefined,
    environment: dbCity.environment as EnvironmentType[] || undefined,
    bestSeason: dbCity.best_season as SeasonType || undefined,
    description: undefined,
    monthlyWeather,
  };
}

// ============================
// 도시 조회 함수
// ============================

/**
 * 도시 목록 조회 (필터/정렬 적용)
 */
export async function getCitiesList(
  supabase: SupabaseClient<Database>,
  {
    sort = "score",
    region = "all",
    budget,
    search,
    environment,
    season,
    limit = 12,
    offset = 0,
  }: {
    sort?: string;
    region?: string;
    budget?: string;
    search?: string;
    environment?: string;
    season?: string;
    limit?: number;
    offset?: number;
  }
) {
  let query = supabase.from("cities").select("*, city_metrics(*)", { count: "exact" });

  // 숨겨진 도시 제외 (일반 사용자용)
  query = query.eq("is_hidden", false);

  // 검색 필터 (도시명)
  if (search && search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  // 지역 필터
  if (region && region !== "all") {
    query = query.eq("region", region as RegionType);
  }

  // 예산 필터
  if (budget) {
    switch (budget) {
      case "under100":
        query = query.lte("monthly_budget", 100);
        break;
      case "100to200":
        query = query.gte("monthly_budget", 100).lte("monthly_budget", 200);
        break;
      case "over200":
        query = query.gte("monthly_budget", 200);
        break;
    }
  }

  // 환경 필터 (environment는 배열이므로 contains 사용)
  if (environment && environment !== "all") {
    query = query.contains("environment", [environment as EnvironmentType]);
  }

  // 계절 필터
  if (season && season !== "all") {
    query = query.eq("best_season", season as SeasonType);
  }

  // 정렬
  switch (sort) {
    case "budget-low":
      query = query.order("monthly_budget", { ascending: true });
      break;
    case "budget-high":
      query = query.order("monthly_budget", { ascending: false });
      break;
    case "internet":
      query = query.order("internet_speed", { ascending: false });
      break;
    case "reviews":
      query = query.order("review_count", { ascending: false });
      break;
    case "score":
    default:
      query = query.order("overall_score", { ascending: false });
      break;
  }

  // 페이지네이션
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch cities: ${error.message}`);
  }

  return {
    data: (data || []).map(convertDatabaseCityToCity),
    total: count || 0,
    page: Math.floor(offset / limit) + 1,
  };
}

/**
 * 단일 도시 상세 정보 조회 (City 타입으로 변환)
 */
export async function getCityBySlug(supabase: SupabaseClient<Database>, slug: string): Promise<City> {
  // UUID 형식인지 확인 (간단한 체크)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let query = supabase
    .from("cities")
    .select(
      `
      *,
      city_metrics(*),
      monthly_weather(month, avg_temp, max_temp, min_temp, rainfall)
    `
    )
    .eq("is_hidden", false)
    .order('month', { foreignTable: 'monthly_weather', ascending: true });

  // UUID 형식이면 ID로, 아니면 name으로 조회
  if (isUUID) {
    query = query.eq("id", slug);
  } else {
    query = query.eq("name", slug);
  }

  const { data: city, error } = await query.single();

  if (error || !city) {
    throw new Error(`City not found: ${slug}`);
  }

  return convertDatabaseCityToCity(city);
}

/**
 * 도시 메트릭 조회
 */
export async function getCityMetrics(supabase: SupabaseClient<Database>, cityId: string) {
  const { data, error } = await supabase
    .from("city_metrics")
    .select("*")
    .eq("city_id", cityId)
    .single();

  if (error) {
    return null;
  }

  return data;
}
