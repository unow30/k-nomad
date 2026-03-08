## 🔐 Supabase SSR 인증 동작 방식

### 1️⃣ JWT는 쿠키에 자동 저장됩니다

로그인 성공 시:
```
브라우저 → 로그인 요청 → Supabase Auth 서버
↓
Access Token (JWT) + Refresh Token 발급
↓
쿠키에 자동 저장 (sb-<project_id>-auth-token)

쿠키 이름: sb-{project_ref}-auth-token (기본값)
```

---
### 2️⃣ Middleware에서 쿠키를 읽고 사용자 정보를 헤더에 주입합니다

`middleware.ts`의 전체 흐름:

```ts
// [1단계] 토큰 갱신 쿠키를 받을 임시 응답
const cookieResponse = NextResponse.next({ request })

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  {
    cookies: {
      getAll() {
        return request.cookies.getAll()  // 👈 모든 쿠키 읽기
      },
      setAll(cookiesToSet) {
        // 토큰 갱신 시 cookieResponse에 쿠키 저장
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieResponse.cookies.set(name, value, options)
        })
      },
    },
  }
)
```

#### 핵심:
- `cookies.getAll()`: 요청에서 모든 쿠키를 가져옵니다 (JWT 포함)
- `createServerClient`가 자동으로 `sb-*-auth-token` 쿠키를 찾아서 JWT를 추출합니다

---
### 3️⃣ getUser()가 쿠키의 JWT를 자동 검증합니다

```ts
// [2단계] 액세스 토큰 검증 + 만료 시 리프레시 토큰으로 재발급 (자동)
const {
  data: { user },
} = await supabase.auth.getUser()  // 👈 JWT를 명시적으로 전달하지 않음
```

#### 내부 동작:
1. `getUser()`가 내부적으로 쿠키에서 JWT를 읽음
2. JWT 서명 검증 (Supabase 공개키로)
3. JWT 만료 시간 확인
4. 유효하면 사용자 정보 반환, 무효하면 null

---
### 4️⃣ 사용자 정보를 Request Headers에 주입합니다 (신규)

인증 확인 후, user 정보와 DB에서 조회한 role을 요청 헤더에 주입합니다.
서버 컴포넌트와 API Route에서 DB 재조회 없이 헤더로 바로 접근할 수 있습니다.

```ts
// [3단계] user 정보를 requestHeaders에 주입
if (user) {
  requestHeaders.set('x-user-id', user.id)
  if (user.email) {
    requestHeaders.set('x-user-email', user.email)
  }

  // users 테이블에서 role 조회 후 헤더에 주입
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role) {
    requestHeaders.set('x-user-role', userData.role)
  }
}
```

#### 주입되는 헤더:
| 헤더 | 값 | 비고 |
|------|-----|------|
| `x-user-id` | `user.id` (UUID) | 항상 주입 |
| `x-user-email` | `user.email` | 이메일 존재 시 주입 |
| `x-user-role` | `'admin'` 또는 `'user'` | DB `users.role` 기반 |

---
### 5️⃣ 최종 응답 재조립 (신규)

토큰 갱신 쿠키와 사용자 정보 헤더를 모두 포함한 최종 응답을 만듭니다.

```ts
// [4단계] 최종 응답 재조립 (requestHeaders + 갱신된 쿠키 보존)
const finalResponse = NextResponse.next({
  request: { headers: requestHeaders },
})
cookieResponse.cookies.getAll().forEach(cookie =>
  finalResponse.cookies.set(cookie.name, cookie.value, { path: '/' })
)
```

---
### 6️⃣ 자동 갱신 (Token Refresh)

JWT가 만료되기 전에 Supabase 클라이언트가 자동으로:
1. Refresh Token으로 새로운 Access Token 요청
2. 새로운 JWT를 `cookieResponse`에 저장
3. `finalResponse`에 갱신된 쿠키 복사

---
### 7️⃣ 경로 보호 로직

```
공개 경로: /, /city, /login, /register → 보호 건너뜀

/admin/** → 미인증 시 /login?redirect=... 으로 리디렉션
            인증됐지만 role != 'admin' 시 /?error=unauthorized 리디렉션

/dashboard/** → 미인증 시 /login 리디렉션
```

---
## 📊 전체 흐름도

```
1. 로그인 성공
   ↓
2. JWT + Refresh Token → 쿠키 저장 (브라우저)
   ↓
3. 사용자가 페이지 요청
   ↓
4. Middleware 실행
   ├─ [1] cookieResponse 생성 (토큰 갱신 쿠키 수신용)
   ├─ [2] createServerClient → request.cookies에서 JWT 추출
   ├─ [3] getUser() → JWT 검증 + 만료 시 자동 재발급
   ├─ [4] user 있으면 x-user-id, x-user-email 헤더 주입
   │       users 테이블에서 role 조회 → x-user-role 헤더 주입
   ├─ [5] finalResponse 재조립 (requestHeaders + 갱신된 쿠키)
   └─ [6] 경로 보호 (공개/admin/dashboard)
      ↓
5. 서버 컴포넌트 / API Route
   └─ headers()로 x-user-id, x-user-role 등 바로 접근 가능
```

---
## 🗂️ Supabase 클라이언트 종류

| 파일 | 함수 | 사용처 | 특징 |
|------|------|--------|------|
| `utils/supabase/server.ts` | `createClient()` | 서버 컴포넌트, Server Actions | `cookies()` API 연동, 세션 관리 |
| `utils/supabase/server.ts` | `createAdminClient()` | 관리자 전용 Server Actions | Service Role Key, RLS 우회 |
| `utils/supabase/client.ts` | `createClient()` | 클라이언트 컴포넌트 | `createBrowserClient`, 쿠키 자동 관리 |
| `middleware.ts` | (내부 생성) | Middleware | `createServerClient`, 헤더 주입 |

> ⚠️ `createAdminClient()`는 `SUPABASE_SERVICE_ROLE_KEY`가 필요하며 RLS를 무시합니다. 반드시 관리자 권한 확인 후 사용해야 합니다.

---
## 🔑 환경변수

| 변수 | 사용처 |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | 모든 클라이언트 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | 일반 클라이언트 (기존 ANON_KEY 대체) |
| `SUPABASE_SERVICE_ROLE_KEY` | `createAdminClient()` 전용 (서버 전용) |

---
## ✅ 요약

- `@supabase/ssr` 패키지가 쿠키 기반 인증을 자동으로 처리합니다
- Middleware는 단순 토큰 갱신 외에도 **사용자 정보(id, email, role)를 헤더에 주입**합니다
- 서버 컴포넌트/API Route에서는 `headers()`로 인증 정보를 DB 재조회 없이 사용할 수 있습니다
- 관리자 기능은 `createAdminClient()`로 RLS를 우회하여 처리합니다
