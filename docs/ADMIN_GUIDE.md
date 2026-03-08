# 관리자 기능 가이드

대한민국 노마드 도시 플랫폼의 관리자 기능에 대한 종합 가이드입니다.

## 목차

1. [관리자 계정](#관리자-계정)
2. [관리자 대시보드](#관리자-대시보드)
3. [도시 관리](#도시-관리)
4. [작업공간 관리](#작업공간-관리)
5. [리뷰 관리](#리뷰-관리)
6. [보안 및 권한](#보안-및-권한)
7. [테스트 시나리오](#테스트-시나리오)

---

## 관리자 계정

### 개발 환경 관리자 계정

**로그인 정보:**
- Email: `admin001@test.ai`
- Password: `qwer1234(예시)`
- 역할: `admin`

### 새 관리자 계정 생성 (프로덕션)

프로덕션 환경에서는 Supabase Dashboard를 통해 직접 사용자를 생성하고, `public.users` 테이블에서 `role`을 `admin`으로 수정하세요.

```sql
-- 1. Supabase Dashboard에서 사용자 생성 후
-- 2. SQL Editor에서 다음 쿼리 실행
UPDATE public.users
SET role = 'admin'::user_role
WHERE email = 'admin@example.com';
```

---

## 관리자 대시보드

### 접속 방법

1. 관리자 계정으로 로그인
2. URL: `/admin` 또는 홈페이지에서 관리자 메뉴 클릭

### 대시보드 기능

**통계 카드:**
- 총 도시 수
- 작업공간 수
- 리뷰 수 (공개/숨김)
- 전체 사용자 수

**빠른 작업:**
- 새 도시 추가
- 작업공간 추가
- 사용자 뷰로 전환

---

## 도시 관리

### 도시 목록 (`/admin/cities`)

**표시 정보:**
- 순위, 도시명, 지역, 평점, 리뷰 수, 생활비
- 이미지 썸네일

**가능한 작업:**
- 도시 수정
- 도시 삭제 (CASCADE: 관련 데이터 모두 삭제)

### 도시 추가 (`/admin/cities/new`)

**필수 입력 항목:**
- 도시명 (한글) *
- 지역 * (jeju, gyeongsang, gangwon, jeolla, chungcheong, seoul, gyeonggi)
- 행정구역 *

**선택 입력 항목:**

**기본 정보:**
- 도시명 (영문)
- 순위
- 평점 (0-5)
- 최적 계절 (spring, summer, fall, winter)
- 이미지 URL
- 태그 (쉼표로 구분)

**생활비 정보:**
- 월 생활비 (만원)
- 월세 (만원)
- 카페 수
- 인터넷 속도 (Mbps)
- KTX 소요시간 (시간)

**위치 정보:**
- 위도/경도
- 주소
- 기상청 관측소 ID

### 도시 수정 (`/admin/cities/[id]/edit`)

- 기존 데이터가 폼에 자동으로 채워짐
- 필요한 항목만 수정 후 저장

### 도시 삭제

⚠️ **주의사항:**
- CASCADE 삭제로 인해 다음 데이터도 함께 삭제됩니다:
  - city_metrics (도시 메트릭)
  - monthly_weather (월별 날씨)
  - workspaces (작업공간)
  - user_reviews (리뷰)
  - user_ratings (평가)
  - user_city_reactions (좋아요/싫어요)

---

## 작업공간 관리

### 작업공간 목록 (`/admin/workspaces`)

**표시 정보:**
- 작업공간명, 도시, 타입, WiFi 속도, 가격대, 평점
- 이미지 썸네일

**가능한 작업:**
- 작업공간 수정
- 작업공간 삭제 (CASCADE: 리뷰, 평가 함께 삭제)

### 작업공간 추가 (`/admin/workspaces/new`)

**필수 입력 항목:**
- 도시 * (드롭다운에서 선택)
- 작업공간명 (한글) *
- 타입 * (cafe, coworking, library, hotel_lobby, other)
- 주소 *

**선택 입력 항목:**

**기본 정보:**
- 작업공간명 (영문)
- 가격대 (free, low, medium, high)
- 설명
- 이미지 URL

**시설 정보:**
- WiFi 속도 (Mbps)
- 콘센트 유무
- 운영시간
- 전화번호
- 웹사이트

**위치 정보:**
- 위도/경도 (Google Maps에서 우클릭 → 좌표 복사)

### 작업공간 수정 (`/admin/workspaces/[id]/edit`)

- 기존 데이터가 폼에 자동으로 채워짐
- 필요한 항목만 수정 후 저장

---

## 리뷰 관리

### 리뷰 목록 (`/admin/reviews`)

**표시 정보:**
- 리뷰 제목, 평점 (⭐), 도시, 작성자, 작성일
- 숨김 상태 표시 (🔴 숨김)

**필터:**
- 전체 리뷰
- 공개 리뷰
- 숨김 리뷰

**가능한 작업:**
- 리뷰 숨김 처리 (🚫)
- 리뷰 숨김 해제 (✓)
- 리뷰 삭제 (🗑️)

### 리뷰 숨김 처리

**동작:**
- 일반 사용자에게는 보이지 않음 (RLS 정책으로 제어)
- 관리자는 계속 볼 수 있음
- 도시 상세 페이지에서 자동으로 제외됨

**사용 시나리오:**
- 부적절한 내용 포함
- 스팸 리뷰
- 신고된 리뷰

### 리뷰 삭제

⚠️ **주의사항:**
- 완전히 삭제되며 복구 불가
- 숨김 처리와 달리 데이터베이스에서 영구 삭제
- 신중하게 사용할 것

---

## 보안 및 권한

### 권한 체계

**일반 사용자 (role: user):**
- 도시/작업공간 조회
- 리뷰/평가 작성
- 자신의 리뷰만 수정/삭제

**관리자 (role: admin):**
- 일반 사용자의 모든 권한
- 도시 CRUD
- 작업공간 CRUD
- 모든 리뷰 관리 (숨김/삭제)

### 접근 제어

**미들웨어 보호:**
- `/admin/*` 경로는 자동으로 관리자 권한 확인
- 미인증 사용자 → 로그인 페이지로 리디렉션
- 일반 사용자 → 홈페이지로 리디렉션 (error=unauthorized)

**RLS (Row Level Security) 정책:**
- `cities`: 관리자만 INSERT/UPDATE/DELETE
- `workspaces`: 관리자만 INSERT/UPDATE/DELETE
- `user_reviews`: 일반 사용자는 hidden=false인 리뷰만 조회
- `user_reviews`: 관리자는 모든 리뷰 조회 가능

**Server Actions:**
- 모든 관리자 전용 작업은 `requireAdmin()` 호출
- 권한 없으면 에러 발생 및 작업 중단

---

## 테스트 시나리오

### 1. 관리자 로그인 테스트

**단계:**
1. 로그아웃 상태에서 `/admin` 접속
2. `/login?redirect=/admin`으로 리디렉션 확인
3. `admin001@test.ai` / `qwer1234(예시)`로 로그인
4. `/admin` 대시보드로 리디렉션 확인
5. 통계 데이터가 올바르게 표시되는지 확인

### 2. 일반 사용자 접근 차단 테스트

**단계:**
1. 일반 사용자 계정으로 로그인
2. 주소창에 `/admin` 입력
3. 홈페이지(`/`)로 리디렉션되는지 확인
4. URL에 `error=unauthorized` 파라미터 확인

### 3. 도시 CRUD 테스트

**생성:**
1. `/admin/cities/new` 접속
2. 필수 항목 입력
3. "생성하기" 클릭
4. `/admin/cities` 목록에 새 도시 표시 확인
5. 홈페이지에서도 새 도시 표시 확인

**수정:**
1. 도시 목록에서 "수정" 클릭
2. 정보 변경 (예: 평점, 생활비)
3. "수정하기" 클릭
4. 변경사항 반영 확인

**삭제:**
1. 도시 목록에서 "삭제" 클릭
2. 확인 다이얼로그 내용 확인
3. "확인" 클릭
4. 목록에서 도시 제거 확인

### 4. 작업공간 CRUD 테스트

**생성:**
1. `/admin/workspaces/new` 접속
2. 도시 선택 (드롭다운)
3. 필수 항목 입력
4. "생성하기" 클릭
5. 목록에 새 작업공간 표시 확인

**수정 및 삭제:**
- 도시 테스트와 동일한 절차

### 5. 리뷰 관리 테스트

**리뷰 숨김:**
1. 일반 사용자로 리뷰 작성
2. 관리자 계정으로 `/admin/reviews` 접속
3. 작성한 리뷰에서 "숨김 처리" 클릭
4. 🔴 숨김 배지 표시 확인
5. 로그아웃 후 도시 상세 페이지에서 리뷰가 보이지 않는지 확인

**리뷰 숨김 해제:**
1. 숨겨진 리뷰에서 "숨김 해제" 클릭
2. 배지 제거 확인
3. 일반 사용자에게 다시 보이는지 확인

**리뷰 삭제:**
1. 리뷰에서 "삭제" 클릭
2. 확인 다이얼로그 확인
3. 데이터베이스에서 완전히 제거되었는지 확인

### 6. RLS 정책 테스트

**일반 사용자가 숨겨진 리뷰를 볼 수 없는지 확인:**
```sql
-- 일반 사용자 세션에서
SELECT * FROM user_reviews WHERE hidden = true;
-- 결과: 0개 (RLS 정책으로 필터링됨)
```

**관리자는 모든 리뷰를 볼 수 있는지 확인:**
```sql
-- 관리자 세션에서
SELECT * FROM user_reviews WHERE hidden = true;
-- 결과: 모든 숨겨진 리뷰 표시
```

### 7. 캐시 무효화 테스트

**동작 확인:**
1. 관리자가 도시 정보 수정
2. 홈페이지에서 즉시 변경사항 반영 확인
3. 도시 상세 페이지에서도 변경사항 확인

### 8. 에러 처리 테스트

**권한 없는 작업 시도:**
1. 브라우저 콘솔에서 Server Action 직접 호출
   ```javascript
   // 일반 사용자 세션에서
   await deleteCity('city-id');
   ```
2. "관리자 권한이 필요합니다" 에러 확인

**잘못된 데이터 입력:**
1. 도시 생성 시 필수 항목 누락
2. 브라우저 기본 검증 메시지 확인

---

## 문제 해결

### 관리자 페이지에 접근할 수 없음

**증상:** `/admin` 접속 시 홈페이지로 리디렉션

**해결:**
1. 데이터베이스에서 사용자 역할 확인:
   ```sql
   SELECT email, role FROM public.users WHERE email = 'your-email@example.com';
   ```
2. role이 'admin'이 아니면 업데이트:
   ```sql
   UPDATE public.users SET role = 'admin'::user_role WHERE email = 'your-email@example.com';
   ```

### 리뷰가 숨겨지지 않음

**증상:** 숨김 처리했는데 일반 사용자에게도 보임

**해결:**
1. RLS 정책 확인:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_reviews';
   ```
2. 마이그레이션 재적용:
   ```bash
   npm run supabase:reset
   ```

### 도시 삭제 시 에러 발생

**증상:** "외래 키 제약 조건 위반" 에러

**해결:**
- 데이터베이스 마이그레이션에서 CASCADE 설정 확인
- 관련 데이터를 먼저 삭제하거나 CASCADE ON DELETE 추가

---

## 프로덕션 배포 체크리스트

- [ ] `.env` 파일에서 프로덕션 Supabase URL/Key로 변경
- [ ] 개발용 관리자 계정 비활성화 또는 삭제
- [ ] 프로덕션 관리자 계정 생성
- [ ] RLS 정책 모두 활성화 확인
- [ ] 미들웨어 경로 보호 확인
- [ ] 모든 Server Actions에 `requireAdmin()` 호출 확인
- [ ] 이미지 업로드 전략 결정 (현재는 URL만 지원)
- [ ] 에러 로깅 설정 (Sentry 등)
- [ ] 백업 정책 수립

---

## 참고 자료

- [Supabase RLS 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [프로젝트 CLAUDE.md](/CLAUDE.md)
