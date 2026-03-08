'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

// 작업공간 생성 데이터 타입
export interface CreateWorkspaceData {
  city_id: string;
  name: string;
  name_en?: string;
  type: 'cafe' | 'coworking' | 'library' | 'hotel_lobby' | 'other';
  address: string;
  description?: string;
  wifi_speed?: number;
  has_power?: boolean;
  price_range?: 'free' | 'low' | 'medium' | 'high';
  opening_hours?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
}

/**
 * 작업공간 생성 (관리자 전용)
 */
export async function createWorkspace(data: CreateWorkspaceData) {
  try {
    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClient();

    // 작업공간 생성
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert({
        city_id: data.city_id,
        name: data.name,
        name_en: data.name_en,
        type: data.type,
        address: data.address,
        description: data.description,
        wifi_speed: data.wifi_speed,
        has_power: data.has_power ?? true,
        price_range: data.price_range || 'low',
        opening_hours: data.opening_hours,
        phone: data.phone,
        website: data.website,
        latitude: data.latitude,
        longitude: data.longitude,
        image_url: data.image_url,
        data_source: 'admin',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`작업공간 생성 실패: ${error.message}`);
    }

    // 캐시 무효화
    revalidatePath('/admin/workspaces');
    revalidatePath(`/city/${workspace.city_id}`);

    return { success: true, data: workspace };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '작업공간 생성 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 작업공간 수정 (관리자 전용)
 */
export async function updateWorkspace(
  workspaceId: string,
  data: Partial<CreateWorkspaceData>
) {
  try {
    // 관리자 권한 확인
    await requireAdmin();

    const supabase = await createClient();

    // 작업공간 수정
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .update(data)
      .eq('id', workspaceId)
      .select()
      .single();

    if (error) {
      throw new Error(`작업공간 수정 실패: ${error.message}`);
    }

    // 캐시 무효화
    revalidatePath('/admin/workspaces');
    revalidatePath(`/city/${workspace.city_id}`);

    return { success: true, data: workspace };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '작업공간 수정 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 작업공간 숨김 상태 토글 (관리자 전용)
 * 삭제 대신 is_hidden 필드를 변경하여 사용자에게 숨김 처리
 */
export async function toggleWorkspaceVisibility(workspaceId: string, isHidden: boolean) {
  try {
    // 관리자 권한 확인
    await requireAdmin();

    // Service Role Key를 사용하여 RLS 우회
    const supabase = createAdminClient();

    // 1. 작업공간 조회 (city_id 획득)
    const { data: workspace, error: selectError } = await supabase
      .from('workspaces')
      .select('city_id')
      .eq('id', workspaceId)
      .single();

    if (selectError || !workspace) {
      throw new Error('작업공간을 찾을 수 없습니다.');
    }

    // 2. 작업공간 숨김 상태 변경
    const { error } = await supabase
      .from('workspaces')
      .update({ is_hidden: isHidden })
      .eq('id', workspaceId);

    if (error) {
      throw new Error(`작업공간 숨김 상태 변경 실패: ${error.message}`);
    }

    // 3. 캐시 무효화 (도시 페이지 추가)
    revalidatePath('/admin/workspaces');
    revalidatePath(`/city/${workspace.city_id}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '작업공간 숨김 상태 변경 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 모든 작업공간 목록 조회 (관리자용)
 */
export async function getAllWorkspaces() {
  try {
    const supabase = await createClient();

    const { data: workspaces, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        cities (
          name,
          name_en
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`작업공간 목록 조회 실패: ${error.message}`);
    }

    return { success: true, data: workspaces };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '작업공간 목록 조회 중 오류가 발생했습니다.',
      data: [],
    };
  }
}

/**
 * 특정 작업공간 조회 (ID로)
 */
export async function getWorkspaceById(workspaceId: string) {
  try {
    const supabase = await createClient();

    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        cities (
          name,
          name_en
        )
      `)
      .eq('id', workspaceId)
      .single();

    if (error) {
      throw new Error(`작업공간 조회 실패: ${error.message}`);
    }

    return { success: true, data: workspace };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '작업공간 조회 중 오류가 발생했습니다.',
      data: null,
    };
  }
}

// ==========================================
// 작업공간 리뷰 관련 Server Actions
// ==========================================

/**
 * 작업공간 리뷰 데이터 타입
 */
export interface WorkspaceReviewData {
  title: string;
  content: string;
  rating: number;
  visitedAt?: string;
  isRecommended?: boolean;
}

/**
 * 작업공간 리뷰 작성
 * API 라우트 호출 (이미지 업로드는 API에서 처리)
 */
export async function submitWorkspaceReview(
  workspaceId: string,
  reviewData: WorkspaceReviewData,
  imageFiles?: File[]
) {
  try {
    const supabase = await createClient();

    // 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('로그인이 필요합니다.');
    }

    // FormData로 리뷰 + 이미지 전송
    const formData = new FormData();
    formData.append('title', reviewData.title);
    formData.append('content', reviewData.content);
    formData.append('rating', reviewData.rating.toString());
    if (reviewData.visitedAt) {
      formData.append('visitedAt', reviewData.visitedAt);
    }
    formData.append(
      'isRecommended',
      (reviewData.isRecommended ?? true).toString()
    );

    // 이미지 추가
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });
    }

    // API 호출
    const response = await fetch(`/api/workspaces/${workspaceId}/reviews`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '리뷰 작성에 실패했습니다.');
    }

    const result = await response.json();

    // 캐시 무효화
    revalidatePath(`/city`);

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '리뷰 작성 중 오류가 발생했습니다.',
      data: null,
    };
  }
}

/**
 * 작업공간 리뷰 수정
 */
export async function updateWorkspaceReview(
  workspaceId: string,
  reviewId: string,
  reviewData: Partial<WorkspaceReviewData>,
  imagesToDelete?: string[],
  newImageFiles?: File[]
) {
  try {
    const supabase = await createClient();

    // 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('로그인이 필요합니다.');
    }

    // FormData 구성
    const formData = new FormData();
    if (reviewData.title) {
      formData.append('title', reviewData.title);
    }
    if (reviewData.content) {
      formData.append('content', reviewData.content);
    }
    if (reviewData.rating) {
      formData.append('rating', reviewData.rating.toString());
    }
    if (reviewData.visitedAt) {
      formData.append('visitedAt', reviewData.visitedAt);
    }
    if (reviewData.isRecommended !== undefined) {
      formData.append('isRecommended', reviewData.isRecommended.toString());
    }

    // 삭제할 이미지
    if (imagesToDelete && imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }

    // 새 이미지 추가
    if (newImageFiles && newImageFiles.length > 0) {
      newImageFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });
    }

    // API 호출
    const response = await fetch(
      `/api/workspaces/${workspaceId}/reviews/${reviewId}`,
      {
        method: 'PUT',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '리뷰 수정에 실패했습니다.');
    }

    const result = await response.json();

    // 캐시 무효화
    revalidatePath(`/city`);

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '리뷰 수정 중 오류가 발생했습니다.',
      data: null,
    };
  }
}

/**
 * 작업공간 리뷰 삭제
 */
export async function deleteWorkspaceReview(
  workspaceId: string,
  reviewId: string
) {
  try {
    const supabase = await createClient();

    // 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('로그인이 필요합니다.');
    }

    // API 호출
    const response = await fetch(
      `/api/workspaces/${workspaceId}/reviews/${reviewId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '리뷰 삭제에 실패했습니다.');
    }

    // 캐시 무효화
    revalidatePath(`/city`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '리뷰 삭제 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 작업공간 리뷰 이미지 삭제
 */
export async function deleteWorkspaceReviewImage(
  workspaceId: string,
  reviewId: string,
  imageId: string
) {
  try {
    const supabase = await createClient();

    // 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('로그인이 필요합니다.');
    }

    // API 호출
    const response = await fetch(
      `/api/workspaces/${workspaceId}/reviews/${reviewId}/images/${imageId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '이미지 삭제에 실패했습니다.');
    }

    // 캐시 무효화
    revalidatePath(`/city`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '이미지 삭제 중 오류가 발생했습니다.',
    };
  }
}
