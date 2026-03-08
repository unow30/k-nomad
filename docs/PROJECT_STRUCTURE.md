# 프로젝트 구조

## 디렉토리 트리

```
app/
├── page.tsx                    # 홈페이지
├── layout.tsx                  # 루트 레이아웃
├── login/                      # 로그인 페이지
├── register/                   # 회원가입 페이지
├── city/[citySlug]/            # 도시 상세 페이지
├── workspace/[workspaceSlug]/  # 작업공간 상세 페이지
├── suggest-workspace/          # 작업공간 제안 페이지
├── my-suggestions/             # 내 제안 목록 페이지
├── admin/                      # 관리자 페이지
│   ├── cities/                 # 도시 관리 (목록/생성/수정)
│   ├── workspaces/             # 작업공간 관리 (목록/생성/수정)
│   ├── reviews/                # 리뷰 관리
│   └── suggestions/            # 제안 관리 (승인/거절)
├── api/
│   ├── cities/[slug]/          # 도시 조회, metrics, ratings, reviews, workspaces
│   ├── workspaces/[id]/        # 작업공간 조회, reviews, images
│   ├── suggestions/            # 작업공간 제안 제출
│   └── admin/suggestions/      # 제안 승인/거절
└── actions/                    # Server Actions
    ├── auth.ts                 # 로그인, 회원가입, 로그아웃
    ├── cities.ts               # 도시 CRUD
    ├── city-reactions.ts       # 좋아요/싫어요
    ├── reviews.ts              # 리뷰 CRUD
    ├── workspaces.ts           # 작업공간 CRUD
    └── admin.ts                # 관리자 전용 액션

components/
├── ui/                         # Shadcn/Radix 프리미티브
├── layout/                     # Header, Footer, HeroSection, UserMenu
├── city/                       # 도시 관련 컴포넌트
│   ├── CityCard.tsx / CityCardGrid.tsx / CityCardGridClient.tsx
│   ├── CityDetailHero.tsx / CityListSection.tsx / CityJsonLd.tsx
│   ├── LikeDislikeButtons.tsx  # 클라이언트 컴포넌트
│   ├── RatingForm.tsx / ReviewForm.tsx / ReviewSection.tsx
│   ├── WorkspacesSection.tsx / TransportSection.tsx
│   └── WeatherChart.tsx / CostBreakdownChart.tsx / AqiChart.tsx
├── workspace/                  # 작업공간 관련 컴포넌트
│   ├── WorkspaceCard.tsx / WorkspaceSection.tsx / WorkspaceFilters.tsx
│   ├── WorkspaceDetailHero.tsx / WorkspaceDetailModal.tsx
│   ├── WorkspaceReviewForm.tsx / WorkspaceReviewEditForm.tsx
│   ├── WorkspaceReviewList.tsx / WorkspaceReviewSection.tsx
│   ├── SuggestionForm.tsx
│   └── ImageUploadInput.tsx / ImageCaptionInput.tsx
├── filters/                    # FilterBar (도시 목록 필터/정렬)
└── auth/                       # submit-button.tsx

lib/
├── supabase-queries.ts         # Supabase 쿼리 헬퍼 함수
├── mock-data.ts                # (레거시) Mock 데이터
└── utils.ts                    # cn() 등 스타일 유틸

utils/supabase/
├── client.ts                   # 브라우저용 createBrowserClient
└── server.ts                   # SSR용 createServerClient + createAdminClient

types/
├── city.ts                     # City, CostBreakdown, MonthlyWeather 등
└── database.types.ts           # (자동 생성) Supabase 스키마 타입

supabase/migrations/            # DDL 마이그레이션 파일
docs/                           # 상세 문서
```

## 주요 아키텍처 패턴

### 서버 vs 클라이언트 컴포넌트

기본은 서버 컴포넌트. 아래 경우에만 `'use client'` 추가:
- 상태(useState, useEffect) 또는 이벤트 핸들러가 필요한 경우
- 브라우저 API 사용이 필요한 경우

클라이언트 컴포넌트 예시: `LikeDislikeButtons`, `FilterBar`, `UserMenu`, `CityCardGridClient`

### 인증 흐름

1. `middleware.ts` — 모든 요청에서 JWT 검증 + 토큰 자동 갱신
2. 검증 후 `x-user-id`, `x-user-email`, `x-user-role` 헤더를 request에 주입
3. 서버 컴포넌트 / API Route에서 `headers()`로 사용자 정보 접근 (DB 재조회 불필요)
4. 공개 경로: `/`, `/city/*`, `/login`, `/register`
5. 보호 경로: `/admin/*` (role=admin 필요), `/dashboard/*` (인증 필요)

→ 상세: [SUPABASE_SSR_AUTH.md](./SUPABASE_SSR_AUTH.md)

### Supabase 클라이언트 종류

| 파일 | 함수 | 사용처 |
|------|------|--------|
| `utils/supabase/client.ts` | `createClient()` | 클라이언트 컴포넌트 |
| `utils/supabase/server.ts` | `createClient()` | 서버 컴포넌트, Server Actions |
| `utils/supabase/server.ts` | `createAdminClient()` | 관리자 전용 (RLS 우회) |

### 데이터 테이블

| 테이블 | 용도 |
|--------|------|
| `cities` | 도시 기본 정보 |
| `city_metrics` | 현재 날씨(`current_weather` JSONB), 생활비 등 |
| `monthly_weather` | 월별 날씨 + AQI (year, month 인덱스) |
| `workspaces` | 작업공간 정보 |
| `user_reviews` | 도시 리뷰 |
| `user_ratings` | 도시 평가 |
| `users` | 사용자 프로필 + role |
