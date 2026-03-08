import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { Workspace, WorkspaceTypeEnum, PriceRangeType } from "@/types/workspace";

// ============================
// 작업 공간 관련 함수
// ============================

/**
 * 데이터베이스 작업 공간 데이터를 Workspace 타입으로 변환
 */
export function convertDatabaseWorkspaceToWorkspace(dbWorkspace: any): Workspace {
  return {
    id: dbWorkspace.id,
    cityId: dbWorkspace.city_id,
    cityName: dbWorkspace.cities?.name ?? undefined,
    name: dbWorkspace.name,
    nameEn: dbWorkspace.name_en,
    type: dbWorkspace.type as WorkspaceTypeEnum,
    address: dbWorkspace.address,
    description: dbWorkspace.description,
    wifiSpeed: dbWorkspace.wifi_speed,
    hasPower: dbWorkspace.has_power ?? true,
    priceRange: dbWorkspace.price_range as PriceRangeType,
    openingHours: dbWorkspace.opening_hours,
    phone: dbWorkspace.phone,
    website: dbWorkspace.website,
    latitude: dbWorkspace.latitude,
    longitude: dbWorkspace.longitude,
    imageUrl: dbWorkspace.image_url,
    averageRating: dbWorkspace.average_rating ?? 0,
    reviewCount: dbWorkspace.review_count ?? 0,
    dataSource: dbWorkspace.data_source,
    createdAt: dbWorkspace.created_at,
    updatedAt: dbWorkspace.updated_at,
  };
}

/**
 * 도시별 작업 공간 목록 조회 (필터/정렬 적용)
 */
export async function getWorkspacesByCity(
  supabase: SupabaseClient<Database>,
  cityId: string,
  {
    type,
    priceRange,
    sort = "rating",
    limit = 20,
    offset = 0,
  }: {
    type?: WorkspaceTypeEnum;
    priceRange?: PriceRangeType;
    sort?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  let query = supabase
    .from("workspaces")
    .select("*", { count: "exact" })
    .eq("city_id", cityId)
    .eq("is_hidden", false);

  // 타입 필터
  if (type) {
    query = query.eq("type", type);
  }

  // 가격대 필터
  if (priceRange) {
    query = query.eq("price_range", priceRange);
  }

  // 정렬
  switch (sort) {
    case "reviews":
      query = query.order("review_count", { ascending: false });
      break;
    case "wifi-speed":
      query = query.order("wifi_speed", { ascending: false, nullsFirst: false });
      break;
    case "price-low":
      query = query.order("price_range", { ascending: true });
      break;
    case "price-high":
      query = query.order("price_range", { ascending: false });
      break;
    case "rating":
    default:
      query = query.order("average_rating", { ascending: false });
      break;
  }

  // 페이지네이션
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch workspaces: ${error.message}`);
  }

  return {
    data: (data || []).map(convertDatabaseWorkspaceToWorkspace),
    total: count || 0,
    page: Math.floor(offset / limit) + 1,
  };
}

/**
 * 단일 작업 공간 상세 정보 조회
 */
export async function getWorkspaceById(
  supabase: SupabaseClient<Database>,
  workspaceId: string
): Promise<Workspace> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*, cities(id, name)")
    .eq("id", workspaceId)
    .eq("is_hidden", false)
    .single();

  if (error || !data) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  return convertDatabaseWorkspaceToWorkspace(data);
}
