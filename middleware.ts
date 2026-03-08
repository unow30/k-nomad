import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware - 모든 요청에서 세션 자동 갱신 + 사용자 정보 헤더 주입
 *
 * 흐름:
 * 1. cookieResponse 생성 (토큰 갱신 쿠키 수신용)
 * 2. auth.getUser() → 액세스 토큰 검증 + 만료 시 리프레시 토큰으로 재발급
 * 3. user 있으면 users.role 조회 → x-user-id, x-user-role, x-user-email 헤더 설정
 * 4. finalResponse 재조립 (requestHeaders + 갱신된 쿠키 보존)
 * 5. 경로 보호 로직
 */
export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)

  // [1단계] 토큰 갱신 쿠키를 받을 임시 응답
  const cookieResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 토큰 갱신 시 setAll 호출 → cookieResponse에 쿠키 저장
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // [2단계] 액세스 토큰 검증 + 만료 시 리프레시 토큰으로 재발급 (자동)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // [3단계] user 정보를 requestHeaders에 주입
  if (user) {
    requestHeaders.set('x-user-id', user.id)
    if (user.email) {
      requestHeaders.set('x-user-email', user.email)
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role) {
      requestHeaders.set('x-user-role', userData.role)
    }
  }

  // [4단계] 최종 응답 재조립 (requestHeaders + 갱신된 쿠키 보존)
  const finalResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })
  cookieResponse.cookies.getAll().forEach(cookie =>
    finalResponse.cookies.set(cookie.name, cookie.value, { path: '/' })
  )

  // 공개 경로는 경로 보호 건너뛰기
  const publicPaths = ['/', '/city', '/login', '/register']
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  )

  if (isPublicPath) {
    return finalResponse
  }

  // 관리자 페이지 보호
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 미인증 사용자는 로그인 페이지로 리디렉션
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // 이미 조회된 role을 로컬 변수에서 재사용 (DB 재조회 없음)
    const userRole = requestHeaders.get('x-user-role')
    if (userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
  }

  // 인증이 필요한 페이지에 미인증 사용자 접근 시 로그인 페이지로 리디렉션
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return finalResponse
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 요청 경로에 매칭:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘 파일)
     * - 이미지 파일 (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
