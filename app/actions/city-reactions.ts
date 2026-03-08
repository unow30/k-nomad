'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export type ReactionType = 'like' | 'dislike'

export interface CityReaction {
  city_like: boolean
  city_dislike: boolean
}

/**
 * 도시에 대한 사용자 반응 조회
 */
export async function getCityReaction(
  cityId: string
): Promise<CityReaction | null> {
  const supabase = await createClient()

  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // 사용자의 도시 반응 조회
  const { data, error } = await supabase
    .from('user_city_reactions')
    .select('city_like, city_dislike')
    .eq('user_id', user.id)
    .eq('city_id', cityId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching city reaction:', error)
    return null
  }

  return data
}

/**
 * 여러 도시에 대한 사용자 반응 일괄 조회
 * @returns cityId를 키로 하는 Map
 */
export async function getCityReactions(
  cityIds: string[]
): Promise<Map<string, CityReaction>> {
  const supabase = await createClient()
  const reactionsMap = new Map<string, CityReaction>()

  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || cityIds.length === 0) {
    return reactionsMap
  }

  // 여러 도시의 반응 한 번에 조회
  const { data, error } = await supabase
    .from('user_city_reactions')
    .select('city_id, city_like, city_dislike')
    .eq('user_id', user.id)
    .in('city_id', cityIds)

  if (error) {
    console.error('Error fetching city reactions:', error)
    return reactionsMap
  }

  // Map으로 변환
  data?.forEach((reaction) => {
    reactionsMap.set(reaction.city_id, {
      city_like: reaction.city_like,
      city_dislike: reaction.city_dislike,
    })
  })

  return reactionsMap
}

/**
 * 도시에 대한 좋아요/싫어요 토글
 */
export async function toggleCityReaction(
  cityId: string,
  reactionType: ReactionType
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  try {
    // 기존 반응 조회 (인라인으로 최적화 - waterfall 제거)
    const { data: existingReaction } = await supabase
      .from('user_city_reactions')
      .select('city_like, city_dislike')
      .eq('user_id', user.id)
      .eq('city_id', cityId)
      .maybeSingle()

    // 새로운 반응 상태 계산
    const isTogglingLike = reactionType === 'like'
    const newLike = isTogglingLike
      ? !(existingReaction?.city_like ?? false)
      : false
    const newDislike = !isTogglingLike
      ? !(existingReaction?.city_dislike ?? false)
      : false

    // UPSERT (INSERT or UPDATE)
    const { error } = await supabase.from('user_city_reactions').upsert(
      {
        user_id: user.id,
        city_id: cityId,
        city_like: newLike,
        city_dislike: newDislike,
      },
      {
        onConflict: 'user_id,city_id',
      }
    )

    if (error) {
      console.error('Error toggling city reaction:', error)
      return { success: false, error: '반응 업데이트에 실패했습니다' }
    }

    // 캐시 갱신 (도시 상세 페이지 및 홈페이지)
    revalidatePath('/')
    revalidatePath(`/city/${cityId}`)

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '예상치 못한 오류가 발생했습니다' }
  }
}
