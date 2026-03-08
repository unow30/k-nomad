// 사용자 역할 타입
export type UserRole = 'user' | 'admin';

// 사용자 인터페이스
export interface User {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// 세션 사용자 (Supabase Auth User)
export interface SessionUser {
  id: string;
  email?: string;
  user_metadata?: {
    display_name?: string;
    avatar_url?: string;
  };
}
