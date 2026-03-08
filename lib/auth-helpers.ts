import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { User, UserRole } from '@/types/user';

/**
 * 현재 로그인한 사용자의 정보를 가져옵니다 (public.users 테이블)
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  return user;
}

/**
 * 현재 로그인한 사용자가 관리자인지 확인합니다
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

/**
 * 관리자 권한이 필요한 작업을 실행합니다
 * 관리자가 아니면 에러를 발생시킵니다
 */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  if (user.role !== 'admin') {
    throw new Error('관리자 권한이 필요합니다.');
  }

  return user;
}

/**
 * 사용자 역할을 확인합니다
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return user?.role ?? null;
}

/**
 * 로그인한 사용자인지 확인합니다
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

/**
 * 미들웨어가 주입한 request 헤더에서 user 정보를 읽습니다 (DB 조회 없음)
 * 서버 컴포넌트에서 사용. API 라우트나 Server Actions에서는 getCurrentUser() 사용.
 */
export async function getUserFromRequest(): Promise<{ id: string; role: string | null; email: string | null } | null> {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  if (!userId) return null;
  return {
    id: userId,
    role: headersList.get('x-user-role'),
    email: headersList.get('x-user-email'),
  };
}

/**
 * 미들웨어 헤더 기반으로 관리자 여부를 확인합니다 (DB 조회 없음)
 * 서버 컴포넌트에서 사용.
 */
export async function isAdminFromRequest(): Promise<boolean> {
  const user = await getUserFromRequest();
  return user?.role === 'admin';
}
