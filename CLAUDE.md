# CLAUDE.md

## 프로젝트 개요

**대한민국 노마드 도시** - 디지털 노마드를 위한 한국 도시 정보 플랫폼
Next.js 15 App Router + Supabase 백엔드. 현재 Phase 3 (백엔드 연동) 진행 중.

**스택**: Next.js 15 · TypeScript · Tailwind CSS · Shadcn UI / Radix UI · Supabase (PostgreSQL + Auth) · Vitest

## 커맨드

```bash
npm run dev                    # 개발 서버 (http://localhost:3000)
npm run build                  # 프로덕션 빌드
npm run lint                   # ESLint
npx tsc --noEmit               # TypeScript 타입체크

npm run test                   # 전체 테스트
npm run test:watch             # Watch 모드
npm run test:coverage          # 커버리지 리포트

npm run supabase:start         # 로컬 Supabase 시작
npm run supabase:stop          # 로컬 Supabase 중지
npm run supabase:gen:types     # DB → TypeScript 타입 생성 (마이그레이션 후 필수)
npm run supabase:migration:new # 새 마이그레이션 생성
npm run seed:admin             # 관리자 계정 생성 (Service Role Key 필요)
```

## 프로젝트 구조

→ [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) 참고

## 코드 컨벤션

- **임포트**: `@/*` alias 사용 (`import { cn } from '@/lib/utils'`), 상대 경로 금지
- **컴포넌트**: 기본 서버 컴포넌트. 인터랙션 필요할 때만 `'use client'` 추가
- **인증**: Server Actions (`app/actions/auth.ts`) 사용. Middleware가 `x-user-id` / `x-user-role` 헤더 주입
- **DB 타입**: 마이그레이션 후 `npm run supabase:gen:types` 실행 필수
- **RLS**: 신규 테이블 생성 시 Row Level Security 정책 적용 필수
- **날씨 데이터**: `city_metrics.current_weather` JSONB 필드 사용 (레거시 `current_temp`, `aqi` 컬럼 제거됨)

## 환경변수

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
SUPABASE_SERVICE_ROLE_KEY   # 서버 전용, createAdminClient()에서만 사용
```

`.env` / `.env.local` 모두 git 제외. `.env.local`이 우선 적용됨.

## 절대 금지

| 금지 | 이유 |
|------|------|
| `npx supabase db reset` / `npm run supabase:reset` | DB 전체 초기화 — 필요 시 사용자에게 먼저 확인 |
| `auth.users` 테이블 직접 INSERT | Supabase Auth(GoTrue)와 비호환|
| `SUPABASE_SERVICE_ROLE_KEY` 클라이언트 노출 | RLS 우회로 전체 데이터 접근 가능 |

## 상세 문서

| 주제 | 문서 |
|------|------|
| SSR 인증 동작 방식 | [docs/SUPABASE_SSR_AUTH.md](docs/SUPABASE_SSR_AUTH.md) |
| 마이그레이션 가이드 | [docs/MIGRATION_GUIDELINES.md](docs/MIGRATION_GUIDELINES.md) |
| 관리자 계정 설정 | [docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md) |
| API 문서 | [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) |
| 테스트 체크리스트 | [docs/TEST_CHECKLIST.md](docs/TEST_CHECKLIST.md) |
