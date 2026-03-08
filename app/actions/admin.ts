'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { User } from '@/types/user';

/**
 * 관리자 권한 확인용 Server Action
 * 클라이언트에서 호출하여 현재 사용자가 관리자인지 확인할 수 있습니다
 */
export async function checkAdminPermission(): Promise<{
  isAdmin: boolean;
  user: User | null;
  error?: string;
}> {
  try {
    const user = await requireAdmin();
    return {
      isAdmin: true,
      user,
    };
  } catch (error) {
    return {
      isAdmin: false,
      user: null,
      error: error instanceof Error ? error.message : '권한 확인 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 관리자 전용 작업을 안전하게 실행하는 래퍼 함수
 */
export async function withAdminPermission<T>(
  action: (user: User) => Promise<T>
): Promise<T> {
  const user = await requireAdmin();
  return action(user);
}
