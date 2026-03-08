import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * 서버 컴포넌트 및 Server Actions에서 사용하는 Supabase 클라이언트
 * Next.js cookies API와 연동하여 세션 관리
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 setAll이 호출된 경우
            // Middleware에서 세션 갱신이 이루어지므로 무시해도 됨
          }
        },
      },
    }
  )
}

/**
 * 관리자 전용 Supabase 클라이언트
 * Service Role Key를 사용하여 RLS를 우회함
 * ⚠️ 보안상 매우 민감한 클라이언트이므로 관리자 권한 확인 후에만 사용해야 함
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
