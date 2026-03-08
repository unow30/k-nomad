# API 문서

## 개요

**대한민국 노마드 도시** 플랫폼의 REST API 및 Server Actions 문서입니다.

### 현재 상태
- **Phase 3 백엔드 연동 진행 중**
- 도시 데이터 DB 연동 완료 (Mock 데이터 → Supabase)
- 인증, 리뷰, 평가 시스템 구현 완료
- 월별 날씨 데이터 DB 저장 및 조회 구현 완료

### 주요 특징
- **인증**: Supabase Auth (SSR 지원)
- **데이터베이스**: Supabase PostgreSQL
- **API 방식**: Server Actions (Next.js) + REST API (예정)
- **응답 형식**: JSON

---

## 도시 조회 API

### GET /api/cities

도시 목록을 조회합니다 (필터링 및 정렬 지원).

**쿼리 파라미터:**

| 파라미터 | 타입 | 설명 | 기본값 |
|---------|------|------|--------|
| `sort` | string | 정렬 방식: `score`, `budget-low`, `budget-high`, `internet`, `reviews` | `score` |
| `region` | string | 지역 필터: `all`, `jeju`, `gangwon`, `jeolla`, `gyeongsang`, `chungcheong`, `seoul`, `gyeonggi` | `all` |
| `budget` | string | 예산 필터: `under100`, `100to200`, `over200` | - |
| `limit` | number | 반환할 도시 개수 (최대 100) | `12` |
| `offset` | number | 페이지네이션 오프셋 | `0` |

**응답:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "제주시",
      "region": "jeju",
      "province": "제주특별자치도",
      "rank": 1,
      "overall_score": 4.5,
      "review_count": 127,
      "monthly_budget": 150,
      "rent_studio": 45,
      "internet_speed": 500,
      "cafe_count": 89,
      "current_weather": {
        "temp": 12,
        "aqi": 42,
        "aqi_label": "좋음",
        "rainfall": 45
      },
      "likes": 127,
      "dislikes": 23,
      "image_url": "https://...",
      "tags": ["자연환경", "카페천국"],
      ...
    }
  ],
  "total": 15,
  "page": 1
}
```

**예시:**

```bash
# 강원 지역, 생활비 낮은순
curl "http://localhost:3000/api/cities?region=gangwon&sort=budget-low&limit=5"

# 인터넷 빠른순, 페이지 2
curl "http://localhost:3000/api/cities?sort=internet&limit=12&offset=12"
```

---

### GET /api/cities/[slug]

단일 도시의 상세 정보를 조회합니다.

**파라미터:**

- `slug` (string): 도시 UUID 또는 도시명

**응답:**

```json
{
  "city": {
    "id": "uuid",
    "name": "제주시",
    ...
  },
  "reviews": [
    {
      "id": "review_id",
      "title": "좋은 도시",
      "content": "생활하기 편하고...",
      "rating": 4,
      "created_at": "2026-01-15T...",
      "user_id": "user_uuid",
      "users": {
        "username": "username",
        "profile_image": "url"
      }
    }
  ],
  "user_id": "current_user_uuid_or_null"
}
```

---

### GET /api/cities/[slug]/metrics

도시의 실시간 메트릭을 조회합니다.

**파라미터:**

- `slug` (string): 도시 UUID 또는 도시명

**응답:**

```json
{
  "id": "uuid",
  "city_id": "uuid",
  "current_weather": {
    "temp": 12,
    "aqi": 42,
    "aqi_label": "좋음",
    "rainfall": 45
  },
  "internet_speed": 500,
  "monthly_budget": 150,
  "rent_studio": 45,
  "data_source": "api",
  "created_at": "2026-01-15T...",
  "updated_at": "2026-01-15T..."
}
```

---

## 사용자 평가 API

### POST /api/cities/[slug]/ratings

도시에 대한 평가를 제출합니다.

**인증 필수:** ✅ (로그인 필요)

**파라미터:**

- `slug` (string): 도시 UUID 또는 도시명

**요청 본문:**

```json
{
  "overall_score": 4
}
```

- `overall_score` (1-5): 종합 평점 (필수)

**응답:**

```json
{
  "id": "rating_uuid",
  "city_id": "city_uuid",
  "user_id": "user_uuid",
  "overall_score": 4,
  "created_at": "2026-01-15T...",
  "updated_at": "2026-01-15T..."
}
```

---

### PUT /api/cities/[slug]/ratings

평가를 수정합니다. (POST와 동일하게 처리됨)

---

### DELETE /api/cities/[slug]/ratings

평가를 삭제합니다.

**인증 필수:** ✅

**요청 본문:**

```json
{
  "rating_id": "rating_uuid"
}
```

**응답:**

```json
{
  "success": true
}
```

---

## 사용자 리뷰 API

### POST /api/cities/[slug]/reviews

도시에 대한 리뷰를 작성합니다.

**인증 필수:** ✅

**파라미터:**

- `slug` (string): 도시 UUID 또는 도시명

**요청 본문:**

```json
{
  "title": "좋은 도시",
  "content": "생활하기 편하고 카페가 많습니다.",
  "rating": 4
}
```

- `title` (string): 리뷰 제목
- `content` (string): 리뷰 내용
- `rating` (1-5): 평점

**응답:**

```json
{
  "id": "review_uuid",
  "city_id": "city_uuid",
  "user_id": "user_uuid",
  "title": "좋은 도시",
  "content": "생활하기 편하고 카페가 많습니다.",
  "rating": 4,
  "created_at": "2026-01-15T...",
  "updated_at": "2026-01-15T..."
}
```

---

### PUT /api/cities/[slug]/reviews/[reviewId]

리뷰를 수정합니다.

**인증 필수:** ✅

**파라미터:**

- `slug` (string): 도시 UUID
- `reviewId` (string): 리뷰 UUID

**요청 본문:** (POST와 동일)

---

### DELETE /api/cities/[slug]/reviews/[reviewId]

리뷰를 삭제합니다.

**인증 필수:** ✅

**응답:**

```json
{
  "success": true
}
```

---

## 에러 응답

### 401 Unauthorized

```json
{
  "error": "로그인이 필요합니다"
}
```

### 400 Bad Request

```json
{
  "error": "평점은 1-5 사이의 숫자여야 합니다"
}
```

### 404 Not Found

```json
{
  "error": "메트릭 정보를 찾을 수 없습니다"
}
```

### 500 Internal Server Error

```json
{
  "error": "도시 목록을 불러올 수 없습니다"
}
```

---

## 사용 예시

### JavaScript/TypeScript 예시

```typescript
// 도시 목록 조회
async function getCities(filters = {}) {
  const params = new URLSearchParams({
    sort: 'score',
    region: 'all',
    limit: '12',
    offset: '0',
    ...filters,
  });

  const res = await fetch(`/api/cities?${params}`);
  return res.json();
}

// 평가 제출
async function submitRating(cityId, { overall_score }) {
  const res = await fetch(`/api/cities/${cityId}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ overall_score }),
  });
  return res.json();
}

// 리뷰 작성
async function createReview(cityId, { title, content, rating }) {
  const res = await fetch(`/api/cities/${cityId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, rating }),
  });
  return res.json();
}
```

---

## 인증 API

### 로그인 (Server Action)

**파일**: `app/actions/auth.ts`

```typescript
// Client에서 호출
await signInWithEmail(email, password);
```

**요청**:
- `email` (string): 사용자 이메일
- `password` (string): 비밀번호

**응답**: 성공 시 세션 생성, 실패 시 에러 메시지

---

### 회원가입 (Server Action)

**파일**: `app/actions/auth.ts`

```typescript
await signUpWithEmail(email, password, username);
```

**요청**:
- `email` (string): 사용자 이메일
- `password` (string): 비밀번호
- `username` (string): 사용자명

---

### 로그아웃 (Server Action)

```typescript
await signOutUser();
```

---

## 도시 데이터 조회

### 도시 목록 조회

**현재 상태**: Supabase DB 연동 완료

**데이터 출처**: `lib/supabase-queries.ts` → Supabase PostgreSQL

```typescript
// 15개 도시 Mock 데이터 구조
interface City {
  id: string;
  slug: string;
  name: string;
  region: string;
  image: string;
  overall_score: number;
  reviews_count: number;
  monthly_cost: number;
  monthly_rent: number;
  internet_speed: number;
  current_temp: number;
  aqi: number;
  cafes: number;
  ktx_hours: number;
  likes: number;
  dislikes: number;
  tags: string[];
}
```

---

## 좋아요/싫어요 기능

### 좋아요 토글

**파일**: `components/city/LikeDislikeButtons.tsx` (클라이언트 컴포넌트)

```typescript
// 상태 관리 (클라이언트 사이드)
const [liked, setLiked] = useState(false);
const [disliked, setDisliked] = useState(false);
const [likesCount, setLikesCount] = useState(initialLikes);
const [dislikesCount, setDislikesCount] = useState(initialDislikes);
```

**현재 상태**: UI 구현 완료, DB 연동 예정
**예정 테이블**: `user_city_reactions` (city_id, user_id, reaction_type)

---

## 리뷰 시스템 (구현 완료)

### 리뷰 작성 폼

**파일**: `components/city/ReviewForm.tsx` (클라이언트 컴포넌트)

**기능**:
- 별점 입력 (1-5) ✅
- 리뷰 제목 입력 ✅
- 리뷰 내용 입력 (텍스트 에어리어) ✅
- API 연동: `POST /api/cities/:slug/reviews` ✅

### 리뷰 섹션

**파일**: `components/city/ReviewSection.tsx`

**기능**:
- 리뷰 목록 표시 ✅
- 리뷰 수정/삭제 (본인만) ✅
- 페이지네이션 (예정)

---

## 구현 상태

### ✅ 완성
- 기본 UI 구성
- 사용자 인증 (로그인/회원가입/로그아웃)
- 도시 데이터 DB 연동 (Mock → Supabase)
- 도시 목록 조회 API (필터/정렬/검색)
- 도시 상세 조회 API
- 평가 시스템 (별점)
- 리뷰 시스템 (작성/수정/삭제)
- 월별 날씨 데이터 DB 저장 및 조회
- 차트 컴포넌트 (WeatherChart, AqiChart, CostBreakdownChart)

### 🚧 진행 중
- 좋아요/싫어요 데이터 저장 (UI는 완성, DB 연동 예정)
- 미세먼지 데이터 마이그레이션
- 생활비 데이터 마이그레이션

### 📋 계획 중
| 기능 | 상태 | 예상 시기 |
|------|------|---------|
| 도시 검색 기능 | 계획 중 | Phase 3 |
| 필터링 고도화 | 계획 중 | Phase 3 |
| 추천 알고리즘 | 계획 중 | Phase 4 |
| 커뮤니티 기능 | 계획 중 | Phase 4 |

---

## 타입 정의

### City 타입
```typescript
// types/city.ts
interface City {
  id: string;
  slug: string;
  name: string;
  region: string;
  image: string;
  overall_score: number;
  reviews_count: number;
  monthly_cost: number;
  monthly_rent: number;
  internet_speed: number;
  current_weather: {
    temp: number;
    aqi: number;
    aqi_label: string;
    rainfall: number;
  };
  cafes: number;
  ktx_hours: number;
  likes: number;
  dislikes: number;
  tags: string[];
}

interface MonthlyWeather {
  month: number; // 1-12
  year: number;  // 기록 연도 (예: 2025)
  avg_temp: number;
  min_temp: number;
  max_temp: number;
  rainfall: number;
  aqi?: number; // 대기질 지수 (옵셔널)
}

interface CostBreakdown {
  housing: number;
  food: number;
  transportation: number;
  entertainment: number;
  utilities: number;
}

interface MonthlyAqi {
  month: string;
  avg_aqi: number;
  good_days: number;
  moderate_days: number;
  unhealthy_days: number;
}
```

---

## Supabase 스키마 (구현 완료)

### users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR UNIQUE NOT NULL,
  display_name VARCHAR NOT NULL,
  avatar_url VARCHAR,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### cities 테이블
```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  region VARCHAR NOT NULL,
  province VARCHAR NOT NULL,
  image_url VARCHAR,
  rank INTEGER,
  overall_score DECIMAL,
  review_count INTEGER DEFAULT 0,
  monthly_budget INTEGER,
  rent_studio INTEGER,
  internet_speed INTEGER,
  cafe_count INTEGER,
  ktx_time INTEGER,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  tags TEXT[],
  environment TEXT[],
  best_season VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### city_metrics 테이블
```sql
CREATE TABLE city_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id),
  current_weather JSONB NOT NULL,  -- { temp, aqi, aqi_label, rainfall }
  internet_speed INTEGER,
  monthly_budget INTEGER,
  rent_studio INTEGER,
  data_source VARCHAR DEFAULT 'api',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### monthly_weather 테이블
```sql
CREATE TABLE monthly_weather (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id),
  month INTEGER CHECK (month >= 1 AND month <= 12),
  year INTEGER DEFAULT 2025,
  avg_temp DECIMAL,
  max_temp DECIMAL,
  min_temp DECIMAL,
  rainfall INTEGER,
  aqi INTEGER,  -- 월별 대기질
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### user_ratings 테이블
```sql
CREATE TABLE user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id),
  user_id UUID REFERENCES users(id),
  overall_score INTEGER CHECK (overall_score >= 1 AND overall_score <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(city_id, user_id)
);
```

### user_reviews 테이블
```sql
CREATE TABLE user_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id),
  user_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 개발 환경 설정

### 필요한 환경변수
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 로컬 개발
```bash
# Supabase 시작
npm run supabase:start

# 개발 서버
npm run dev

# 테스트
npm run test
```

---

## 마이그레이션 가이드

### 최근 마이그레이션 (2026-02)

1. **current_weather JSONB 추가**
   - `20260204120000_add_current_weather_jsonb.sql`
   - 레거시 필드를 JSONB 구조로 통합

2. **레거시 필드 제거**
   - `20260204130000_remove_legacy_weather_fields.sql`
   - current_temp, aqi, aqi_label 컬럼 삭제

3. **monthly_weather 확장**
   - `20260204015725_add_year_aqi_to_monthly_weather.sql`
   - year, aqi 필드 추가

### 새 마이그레이션 생성 방법

1. **Supabase 스키마 생성**
   ```bash
   npm run supabase:migration:new your_migration_name
   ```

2. **마이그레이션 파일 작성**
   ```sql
   -- supabase/migrations/{timestamp}_your_migration_name.sql
   -- DDL 작성
   ```

3. **로컬에서 테스트**
   ```bash
   npm run supabase:reset
   npm run dev
   ```

4. **TypeScript 타입 생성**
   ```bash
   npm run supabase:gen:types
   ```

5. **프로덕션 배포**
   ```bash
   git push  # 자동 적용
   ```

---

## 에러 처리

### 인증 에러
```typescript
// 로그인 실패
{
  error: "Invalid login credentials"
}
```

### 유효성 검사 에러
```typescript
// 잘못된 데이터
{
  error: "Validation failed",
  details: ["email must be valid", "password must be 6+ characters"]
}
```

### 서버 에러
```typescript
{
  error: "Internal server error",
  message: "Failed to fetch cities"
}
```

---

## 테스트

### 테스트 작성 예제

```typescript
// components/city/LikeDislikeButtons.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LikeDislikeButtons } from './LikeDislikeButtons';

describe('LikeDislikeButtons', () => {
  it('should toggle like button', () => {
    render(<LikeDislikeButtons initialLikes={10} />);

    const likeBtn = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeBtn);

    expect(likeBtn).toHaveClass('liked');
  });
});
```

### 테스트 실행
```bash
npm run test           # 모든 테스트
npm run test:watch     # Watch 모드
npm run test:ui        # UI 대시보드
npm run test:coverage  # 커버리지 리포트
```

---

## 지원

문제나 피드백이 있으시면:
- GitHub Issues 제출
- 개발 팀에 연락
