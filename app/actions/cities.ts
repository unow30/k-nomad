'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

// 도시 생성 데이터 타입
export interface CreateCityData {
  name: string;
  name_en?: string;
  region: string;
  province: string;
  rank?: number;
  overall_score?: number;
  monthly_budget?: number;
  rent_studio?: number;
  internet_speed?: number;
  cafe_count?: number;
  ktx_time?: number;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  environment?: string[];
  best_season?: string;
  weather_station_id?: number;
  address?: string;
}

/**
 * 도시 생성 (관리자 전용)
 */
export async function createCity(data: CreateCityData) {
  try {
    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClient();

    // 도시 생성
    const { data: city, error } = await supabase
      .from('cities')
      .insert({
        name: data.name,
        name_en: data.name_en,
        region: data.region,
        province: data.province,
        rank: data.rank,
        overall_score: data.overall_score,
        monthly_budget: data.monthly_budget,
        rent_studio: data.rent_studio,
        internet_speed: data.internet_speed,
        cafe_count: data.cafe_count,
        ktx_time: data.ktx_time,
        image_url: data.image_url,
        latitude: data.latitude,
        longitude: data.longitude,
        tags: data.tags,
        environment: data.environment,
        best_season: data.best_season,
        weather_station_id: data.weather_station_id,
        address: data.address,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`도시 생성 실패: ${error.message}`);
    }

    // 캐시 무효화
    revalidatePath('/');
    revalidatePath('/admin/cities');

    return { success: true, data: city };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '도시 생성 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 도시 수정 (관리자 전용)
 */
export async function updateCity(cityId: string, data: Partial<CreateCityData>) {
  try {
    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClient();

    // 도시 수정
    const { data: city, error } = await supabase
      .from('cities')
      .update(data)
      .eq('id', cityId)
      .select()
      .single();

    if (error) {
      throw new Error(`도시 수정 실패: ${error.message}`);
    }

    // 캐시 무효화
    revalidatePath('/');
    revalidatePath('/admin/cities');
    revalidatePath(`/city/${city.name_en || city.name}`);

    return { success: true, data: city };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '도시 수정 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 도시 숨김 상태 토글 (관리자 전용)
 * 삭제 대신 is_hidden 필드를 변경하여 사용자에게 숨김 처리
 */
export async function toggleCityVisibility(cityId: string, isHidden: boolean) {
  try {
    // 관리자 권한 확인
    await requireAdmin();

    // Service Role Key를 사용하여 RLS 우회
    const supabase = createAdminClient();

    // 도시 숨김 상태 변경
    const { error } = await supabase
      .from('cities')
      .update({ is_hidden: isHidden })
      .eq('id', cityId);

    if (error) {
      throw new Error(`도시 숨김 상태 변경 실패: ${error.message}`);
    }

    // 캐시 무효화
    revalidatePath('/');
    revalidatePath('/admin/cities');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '도시 숨김 상태 변경 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 모든 도시 목록 조회 (관리자용 - 상세 정보 포함)
 */
export async function getAllCities() {
  try {
    const supabase = await createClient();

    const { data: cities, error } = await supabase
      .from('cities')
      .select('*')
      .order('rank', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`도시 목록 조회 실패: ${error.message}`);
    }

    return { success: true, data: cities };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '도시 목록 조회 중 오류가 발생했습니다.',
      data: [],
    };
  }
}

/**
 * 특정 도시 조회 (ID로)
 */
export async function getCityById(cityId: string) {
  try {
    const supabase = await createClient();

    const { data: city, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', cityId)
      .single();

    if (error) {
      throw new Error(`도시 조회 실패: ${error.message}`);
    }

    return { success: true, data: city };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '도시 조회 중 오류가 발생했습니다.',
      data: null,
    };
  }
}
