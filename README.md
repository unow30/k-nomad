# 🇰🇷 대한민국 노마드 도시

디지털 노마드를 위한 한국 도시 정보 플랫폼

## 📋 프로젝트 개요

한국에서 디지털 노마드로 생활하려는 사람들에게 도시별 생활 정보(생활비, 인터넷 속도, 작업환경, 날씨, 미세먼지 등)를 체계적으로 제공하는 웹 플랫폼입니다.

현재는 **UI 프로토타입 단계에서 기능 구현 단계로 전환 중**입니다. Mock 데이터 기반 UI는 완성되었으며, Supabase 백엔드 연동과 상호작용 기능을 단계적으로 추가하고 있습니다.

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **Images**: Unsplash (외부 이미지)

## ✨ 구현된 기능

### ✅ UI 컴포넌트 (완성)

- **레이아웃**
  - Header (로고, 검색창, 사용자 메뉴)
  - Footer (링크, 저작권 정보)
  - UserMenu (로그인/로그아웃, 사용자 프로필)

- **필터 및 정렬**
  - FilterBar (지역 필터, 정렬, 상세필터)

- **도시 정보**
  - CityCard (도시 정보 카드)
  - CityCardGrid (반응형 그리드)
  - CityDetailHero (도시 상세페이지 헤더)
  - WeatherChart, CostBreakdownChart, AqiChart (차트 시각화)

- **상호작용**
  - LikeDislikeButtons (좋아요/싫어요 기능)
  - RatingForm, ReviewForm, ReviewSection (리뷰 시스템)

### ✅ 백엔드 연동 (완료)

- Supabase 데이터베이스 구성
- 사용자 인증 (로그인/회원가입)
- 도시 데이터 실제 DB 조회
- 월별 날씨 데이터 연동
- 리뷰/평가 시스템

### ✅ 관리자 기능 (완료)

- **역할 기반 접근 제어 (RBAC)**
  - 일반 사용자 (user) / 관리자 (admin) 구분
  - RLS (Row Level Security) 정책 적용
  - 미들웨어 기반 경로 보호

- **관리자 대시보드** (`/admin`)
  - 시스템 통계 (도시, 작업공간, 리뷰, 사용자 수)
  - 빠른 작업 링크

- **도시 관리** (`/admin/cities`)
  - 도시 생성/수정/삭제 (CRUD)
  - 도시 정보 관리 (기본 정보, 생활비, 위치)
  - CASCADE 삭제 지원

- **작업공간 관리** (`/admin/workspaces`)
  - 작업공간 생성/수정/삭제 (CRUD)
  - 시설 정보 관리 (WiFi, 콘센트, 운영시간)
  - 도시별 작업공간 관리

- **리뷰 관리** (`/admin/reviews`)
  - 부적절한 리뷰 숨김 처리
  - 리뷰 숨김 해제
  - 리뷰 완전 삭제
  - 숨겨진 리뷰는 일반 사용자에게 비노출

### 📊 Mock 데이터

15개 도시 데이터 포함:
- 제주시, 서귀포시, 부산, 강릉, 속초, 여수, 전주, 대전, 대구, 경주, 춘천, 목포, 세종, 포항, 통영

각 도시별 데이터:
- 종합점수, 리뷰 수, 월 생활비, 월세, 인터넷 속도, 현재 기온, 미세먼지(AQI), 카페 수, KTX 시간, 좋아요/싫어요, 태그

### 🎨 UI 특징

- **반응형 디자인**
  - 데스크톱: 3열 그리드
  - 태블릿: 2열 그리드
  - 모바일: 1열 그리드

- **이모지 아이콘 사용**
  - 직관적인 정보 전달 (🏙️ 💵 📶 🌡️ 😷 등)

- **호버 효과**
  - 카드 호버 시 확대 및 그림자 효과

## 🚀 시작하기

### 사전 요구사항

- Node.js 20 이상
- npm 또는 yarn
- Docker (Supabase 로컬 개발 시)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# Supabase 로컬 환경 시작 (선택사항)
npm run supabase:start

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

개발 서버 실행 후 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 테스트 실행

```bash
# 단위 테스트 실행
npm run test

# Watch 모드로 실행
npm run test:watch

# UI 대시보드에서 확인
npm run test:ui

# 커버리지 리포트
npm run test:coverage
```

## 📁 프로젝트 구조

```
nomad/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 홈페이지
│   └── globals.css             # 전역 스타일
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # 헤더
│   │   ├── Footer.tsx          # 푸터
│   │   └── HeroSection.tsx     # 히어로 섹션
│   ├── city/
│   │   ├── CityCard.tsx        # 도시 카드
│   │   └── CityCardGrid.tsx    # 카드 그리드
│   ├── filters/
│   │   └── FilterBar.tsx       # 필터 바
│   └── ui/                     # Shadcn 컴포넌트
├── lib/
│   ├── utils.ts                # 유틸리티 함수
│   └── mock-data.ts            # Mock 데이터
└── types/
    └── city.ts                 # 타입 정의
```

## 📊 Current Phase 진행 상태

### Phase 1: 데이터베이스 스키마 및 RLS 정책 ✅
- `user_role` enum 타입 생성 (user, admin)
- `public.users` 테이블에 `role` 컬럼 추가
- `user_reviews` 테이블에 `hidden` 컬럼 추가
- RLS 정책 설정 (일반 사용자는 숨김 리뷰 조회 불가)
- `is_admin()` 헬퍼 함수 생성

### Phase 2: 인증 및 권한 확인 로직 ✅
- 타입 정의 생성 (`types/user.ts`)
- 인증 헬퍼 함수 (`lib/auth-helpers.ts`)
- 미들웨어 `/admin` 경로 보호
- 관리자 권한 확인 Server Actions

### Phase 3: 관리자 도시 관리 기능 ✅
- 도시 CRUD Server Actions
- 관리자 대시보드 및 레이아웃
- 도시 목록/생성/수정 페이지
- 도시 폼 컴포넌트

### Phase 4: 관리자 작업공간 관리 기능 ✅
- 작업공간 CRUD Server Actions
- 작업공간 목록/생성/수정 페이지
- 작업공간 폼 컴포넌트
- 도시별 작업공간 관리

### Phase 5: 리뷰 관리 기능 ✅
- 리뷰 숨김/숨김 해제 Server Actions
- 리뷰 관리 페이지
- 리뷰 액션 컴포넌트 (숨김/삭제)

### Phase 6: 테스트 및 문서화 ✅
- 관리자 기능 종합 가이드 작성 (`ADMIN_GUIDE.md`)
- 테스트 시나리오 문서화
- README 업데이트

### 향후 계획
- 작업공간 상세 페이지 구현
- 기상청 API 연동 (실시간 날씨 데이터)
- 검색 기능 고도화
- 추천 알고리즘
- 모바일 앱 연동

## 🔐 관리자 기능

### 관리자 계정 (개발 환경)

- **Email**: `admin001@test.ai`
- **Password**: `qwer1234(예시)`
- **접속 URL**: `http://localhost:3000/admin`

### 주요 기능

1. **도시 관리** - 도시 추가/수정/삭제
2. **작업공간 관리** - 작업공간 추가/수정/삭제
3. **리뷰 관리** - 부적절한 리뷰 숨김/삭제

자세한 내용은 [`ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md)를 참고하세요.

## 📚 추가 문서

### docs 폴더
- [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md) - **관리자 기능 종합 가이드** ⭐
- [`docs/ADMIN_SETUP.md`](docs/ADMIN_SETUP.md) - 관리자 계정 설정 및 초기화
- [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) - API 엔드포인트 및 사용 가이드
- [`docs/TEST_CHECKLIST.md`](docs/TEST_CHECKLIST.md) - 테스트 체크리스트
- [`docs/MIGRATION_GUIDELINES.md`](docs/MIGRATION_GUIDELINES.md) - 데이터베이스 마이그레이션 가이드

### 루트 디렉토리
- [`CLAUDE.md`](CLAUDE.md) - 개발자 가이드 및 기술 스택

### 참고 자료
- [`PRD_Homepage_v1.0.md`](.claude/insight/PRD_Homepage_v1.0.md) - 제품 요구사항 정의서
- [`nomads_analysis_report.md`](.claude/insight/nomads_analysis_report.md) - 벤치마크 분석

## 📝 라이선스

이 프로젝트는 프로토타입이며 학습 목적으로 제작되었습니다.

## 🙏 Credits

- UI 참고: [Nomads.com](https://nomads.com)
- 이미지: [Unsplash](https://unsplash.com)
- UI 컴포넌트: [Shadcn UI](https://ui.shadcn.com)
