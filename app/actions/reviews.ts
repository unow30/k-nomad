'use server';

import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

/**
 * 리뷰 숨김 처리 (관리자 전용)
 */
export async function hideReview(reviewId: string) {
  try {
    // 관리자 권한 확인
    await requireAdmin();

    // Service Role Key를 사용하여 RLS 우회
    const supabase = createAdminClient();

    // 리뷰 숨김 처리
    const { data: review, error } = await supabase
      .from('user_reviews')
      .update({ hidden: true })
      .eq('id', reviewId)
      .select('city_id')
      .single();

    if (error) {
      throw new Error(`리뷰 숨김 처리 실패: ${error.message}`);
    }

    // 캐시 무효화
    revalidatePath('/admin/reviews');
    if (review.city_id) {
      revalidatePath(`/city/${review.city_id}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '리뷰 숨김 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 리뷰 숨김 해제 (관리자 전용)
 */
export async function unhideReview(reviewId: string) {
  try {
    // 관리자 권한 확인
    await requireAdmin();

    // Service Role Key를 사용하여 RLS 우회
    const supabase = createAdminClient();

    // 리뷰 숨김 해제
    const { data: review, error } = await supabase
      .from('user_reviews')
      .update({ hidden: false })
      .eq('id', reviewId)
      .select('city_id')
      .single();

    if (error) {
      throw new Error(`리뷰 숨김 해제 실패: ${error.message}`);
    }

    // 캐시 무효화
    revalidatePath('/admin/reviews');
    if (review.city_id) {
      revalidatePath(`/city/${review.city_id}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '리뷰 숨김 해제 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 리뷰 삭제 (관리자 전용)
 */
export async function deleteReview(reviewId: string) {
  try {
    // 관리자 권한 확인
    await requireAdmin();

    // Service Role Key를 사용하여 RLS 우회
    const supabase = createAdminClient();

    // 리뷰 삭제
    const { error } = await supabase
      .from('user_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      throw new Error(`리뷰 삭제 실패: ${error.message}`);
    }

    // 캐시 무효화
    revalidatePath('/admin/reviews');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '리뷰 삭제 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 작업공간 리뷰 숨김 처리 (관리자 전용)
 */
export async function hideWorkspaceReview(reviewId: string) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('workspace_reviews')
      .update({ hidden: true })
      .eq('id', reviewId);

    if (error) {
      throw new Error(`작업공간 리뷰 숨김 처리 실패: ${error.message}`);
    }

    revalidatePath('/admin/workspace-reviews');
    revalidatePath('/city');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '작업공간 리뷰 숨김 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 작업공간 리뷰 숨김 해제 (관리자 전용)
 */
export async function unhideWorkspaceReview(reviewId: string) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('workspace_reviews')
      .update({ hidden: false })
      .eq('id', reviewId);

    if (error) {
      throw new Error(`작업공간 리뷰 숨김 해제 실패: ${error.message}`);
    }

    revalidatePath('/admin/workspace-reviews');
    revalidatePath('/city');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '작업공간 리뷰 숨김 해제 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 작업공간 리뷰 삭제 (관리자 전용)
 */
export async function deleteAdminWorkspaceReview(reviewId: string) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('workspace_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      throw new Error(`작업공간 리뷰 삭제 실패: ${error.message}`);
    }

    revalidatePath('/admin/workspace-reviews');
    revalidatePath('/city');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '작업공간 리뷰 삭제 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 모든 리뷰 목록 조회 (관리자용 - 숨겨진 리뷰 포함)
 */
export async function getAllReviews() {
  try {
    const supabase = await createAdminClient();

    const { data: reviews, error } = await supabase
      .from('user_reviews')
      .select(`
        *,
        cities (
          name,
          name_en
        ),
        users (
          display_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`리뷰 목록 조회 실패: ${error.message}`);
    }

    return { success: true, data: reviews };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '리뷰 목록 조회 중 오류가 발생했습니다.',
      data: [],
    };
  }
}
