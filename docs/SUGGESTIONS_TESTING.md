# 작업공간 제안 시스템 테스트 가이드

## 개요
이 문서는 Phase 1-5에서 구현한 작업공간 제안 시스템의 테스트 및 검증 방법을 설명합니다.

## 환경 설정

### 1. Supabase 로컬 환경 시작
```bash
npm run supabase:start
```

### 2. 개발 서버 시작
```bash
npm run dev
# 포트 3000 또는 사용 가능한 포트에서 실행 (기본값: 3000)
```

### 3. Supabase Studio 접속
```
http://localhost:54323
```

---

## Phase 6.1: 수동 테스트 체크리스트

### A. 일반 사용자 - 제안 작성 플로우

#### 1️⃣ 로그인 및 제안 페이지 접근
- [ ] http://localhost:3000 (또는 3002) 접속
- [ ] "새로운 제안하기" 버튼 클릭 또는 직접 `/suggest-workspace` 접속
- [ ] 로그인하지 않은 경우 자동으로 로그인 페이지로 리디렉션
- [ ] 테스트 계정으로 로그인:
  - 이메일: `test@example.com`
  - 또는 회원가입으로 새 계정 생성

#### 2️⃣ 제안 작성 - 기본 정보
- [ ] 도시 선택 (필수)
  - 드롭다운에서 도시 선택 가능
- [ ] 작업공간명 입력 (필수)
  - 예: "커피숍 이름"
- [ ] 영문 이름 입력 (선택)
  - 예: "Coffee Shop Name"
- [ ] 타입 선택 (필수)
  - 카페, 코워킹, 도서관, 호텔 로비, 기타 중 선택
- [ ] 주소 입력 (필수)

#### 3️⃣ 제안 작성 - 상세 정보
- [ ] WiFi 속도 입력 (선택)
  - 100 Mbps 등 숫자 입력 가능
- [ ] 콘센트 체크박스 확인/해제
  - 기본값: 체크됨 (있음)
- [ ] 가격대 선택 (선택)
  - 무료, 저렴, 보통, 고가 중 선택
- [ ] 영업시간 입력 (선택)
  - 예: "09:00 - 22:00"
- [ ] 전화번호 입력 (선택)
- [ ] 웹사이트 URL 입력 (선택)
  - URL 형식 검증 포함
- [ ] 위도/경도 입력 (선택)

#### 4️⃣ 설명 및 이미지
- [ ] 설명 입력 (선택)
  - 여러 줄 텍스트 입력 가능
  - 500자 이상 작성 권장
- [ ] 이미지 업로드 (선택)
  - JPG, PNG, WEBP 형식만 지원
  - 최대 5MB 크기
  - **테스트 1**: 지원 형식으로 업로드 → 미리보기 표시
  - **테스트 2**: PDF 파일 업로드 시도 → 에러 메시지
  - **테스트 3**: 10MB 이미지 업로드 시도 → 에러 메시지

#### 5️⃣ 제안 제출
- [ ] **성공 케이스 1**: 이미지와 함께 제출
  - ✅ 성공 메시지 표시
  - ✅ `/my-suggestions`로 리디렉션
- [ ] **성공 케이스 2**: 이미지 없이 제출
  - ✅ 성공 메시지 표시
  - ✅ 제안 목록에서 이미지 없는 항목 표시
- [ ] **에러 케이스 1**: 필수 필드 비움
  - ❌ 유효성 에러 메시지 표시
- [ ] **에러 케이스 2**: 비로그인 상태에서 제출
  - ❌ 로그인 페이지로 리디렉션

---

### B. 일반 사용자 - 제안 목록 확인

#### 1️⃣ 내 제안 목록 접근
- [ ] `/my-suggestions` 페이지 접속
- [ ] 비로그인 상태에서 접속 시도 → 로그인 페이지로 리디렉션
- [ ] 로그인 후 자신의 제안만 표시 확인 (다른 사용자 제안 미표시)

#### 2️⃣ 상태별 필터
- [ ] "전체" 탭: 모든 제안 표시
- [ ] "검토 중" 탭: pending 상태 제안만 표시
  - 黃 배경색 표시
  - "관리자 검토 중입니다..." 메시지
- [ ] "승인됨" 탭: approved 상태 제안만 표시
  - 🟢 배경색 표시
  - "축하합니다! 작업공간이 플랫폼에 추가되었습니다" 메시지
- [ ] "거절됨" 탭: rejected 상태 제안만 표시
  - 🔴 배경색 표시
  - 거절 사유 표시

#### 3️⃣ 제안 카드 정보
- [ ] 제안명과 도시명 표시
- [ ] 제출일 표시 (한국 날짜 형식)
- [ ] 이미지 있는 경우 썸네일 표시
- [ ] 이미지 없는 경우 이미지 영역 미표시
- [ ] 상태 배지 표시 및 올바른 색상 적용

#### 4️⃣ 거절된 제안 상세 정보
- [ ] 거절 사유가 빨간 박스로 표시
- [ ] 사유 텍스트가 명확하게 보임

---

### C. Admin 사용자 - 제안 관리 플로우

#### 1️⃣ Admin 계정 생성 및 로그인
```bash
# Admin 계정 생성 (로컬 Supabase)
npm run seed:admin

# 로그인 정보:
# 이메일: admin001@test.ai
# 비밀번호: qwer1234 (또는 설정된 비밀번호)
```
- [ ] Admin 계정으로 로그인 성공
- [ ] `/admin/suggestions` 접근 가능 (일반 사용자는 접근 불가)

#### 2️⃣ 제안 목록 페이지
- [ ] 테이블 형식으로 모든 제안 표시
- [ ] 테이블 컬럼:
  - [ ] 제안자 (이름 또는 이메일)
  - [ ] 도시명
  - [ ] 작업공간명
  - [ ] 상태 (pending/approved/rejected)
  - [ ] 제출일
  - [ ] 검토 버튼
- [ ] 제안 개수 확인 (최신순 정렬)

#### 3️⃣ 제안 상세 페이지 접근
- [ ] 테이블에서 "검토" 버튼 클릭
- [ ] `/admin/suggestions/[id]` 페이지 로드
- [ ] 제안 상세 정보 표시:
  - [ ] 대표 이미지 (있는 경우)
  - [ ] 제안명 (영문명 포함)
  - [ ] 도시명
  - [ ] 상태 배지
  - [ ] 제안자 정보 (이름, 이메일)
  - [ ] 제출일
  - [ ] 작업공간 정보 (타입, 가격대, 주소, WiFi 속도, 영업시간 등)
  - [ ] 설명 (있는 경우)
  - [ ] 좌표 (있는 경우)

#### 4️⃣ 제안 승인 플로우
- [ ] pending 상태 제안에서 "✅ 승인" 버튼 표시
- [ ] 버튼 클릭 시 확인 모달 표시
- [ ] "확인" 클릭
- [ ] ✅ 제안 상태가 "approved"로 변경
- [ ] ✅ 새로운 작업공간이 생성됨
  - `/admin/workspaces`에서 확인 가능
  - 제안자 정보는 `data_source: 'user_suggestion'`으로 표시
- [ ] ✅ 이미지 복사 확인
  - Storage → workspaces 버킷
  - `approved/{workspace_id}/` 폴더에 이미지 존재
- [ ] ✅ `approved_workspace_id` 필드 업데이트

#### 5️⃣ 제안 거절 플로우
- [ ] pending 상태 제안에서 "❌ 거절" 버튼 표시
- [ ] 버튼 클릭 시 모달 표시
  - 텍스트 영역에서 거절 사유 입력
  - 사유 필수 입력 (빈 사유로 제출 불가)
- [ ] 거절 사유 입력 (예: "위치가 중복되었습니다")
- [ ] "거절 확인" 클릭
- [ ] ✅ 제안 상태가 "rejected"로 변경
- [ ] ✅ `admin_note` 필드에 사유 저장
- [ ] ✅ `reviewed_by` (Admin ID) 및 `reviewed_at` 업데이트
- [ ] ✅ 사용자의 `/my-suggestions`에서 거절 사유 표시

#### 6️⃣ 거절된 제안 재처리 불가
- [ ] 거절된 제안은 "❌ 거절" 버튼만 표시 (승인 불가)
- [ ] 승인된 제안도 버튼 미표시 (재처리 불가)

---

### D. 권한 및 보안 테스트

#### 1️⃣ 페이지 접근 제어
- [ ] 비로그인 사용자가 `/suggest-workspace` 접속
  - ❌ 로그인 페이지로 리디렉션
- [ ] 비로그인 사용자가 `/my-suggestions` 접속
  - ❌ 로그인 페이지로 리디렉션
- [ ] 일반 사용자가 `/admin/suggestions` 접속
  - ❌ 리디렉션 또는 403 에러

#### 2️⃣ API 권한 제어
- [ ] `POST /api/suggestions` (비로그인) → 401
- [ ] `GET /api/suggestions` (비로그인) → 401
- [ ] `GET /api/admin/suggestions` (일반 사용자) → 403
- [ ] `PUT /api/admin/suggestions/[id]/approve` (일반 사용자) → 403

#### 3️⃣ RLS 정책 테스트 (Supabase Studio SQL Editor)
```sql
-- 테스트 1: 사용자는 자신의 제안만 조회
SELECT * FROM workspace_suggestions;
-- 결과: 로그인한 사용자의 제안만 표시

-- 테스트 2: Admin은 모든 제안 조회
-- (Admin 계정으로 수행)
SELECT * FROM workspace_suggestions;
-- 결과: 모든 제안 표시

-- 테스트 3: 사용자는 pending 상태만 수정 가능
UPDATE workspace_suggestions
SET description = 'updated'
WHERE id = '[approved-suggestion-id]';
-- 결과: 실패 (RLS 정책 위반)

UPDATE workspace_suggestions
SET description = 'updated'
WHERE id = '[pending-suggestion-id]';
-- 결과: 성공 (자신의 pending 제안)
```

---

## Phase 6.2: 데이터베이스 검증

### Supabase Studio에서 확인

#### 1️⃣ 테이블 확인
```
Database → Tables → workspace_suggestions
```
- [ ] 다음 컬럼 존재:
  - id, city_id, user_id
  - name, name_en, type, address, description
  - wifi_speed, has_power, price_range
  - opening_hours, phone, website
  - latitude, longitude
  - image_path
  - status, admin_note, reviewed_by, reviewed_at
  - approved_workspace_id
  - created_at, updated_at

#### 2️⃣ 인덱스 확인
```
Database → Tables → workspace_suggestions → Indexes
```
- [ ] `idx_workspace_suggestions_city_id`
- [ ] `idx_workspace_suggestions_user_id`
- [ ] `idx_workspace_suggestions_status`
- [ ] `idx_workspace_suggestions_created_at`

#### 3️⃣ RLS 정책 확인
```
Database → Tables → workspace_suggestions → RLS Policies
```
- [ ] "Users can view own suggestions" (SELECT)
- [ ] "Admins can view all suggestions" (SELECT)
- [ ] "Authenticated users can insert suggestions" (INSERT)
- [ ] "Users can update own pending suggestions" (UPDATE)
- [ ] "Admins can update all suggestions" (UPDATE)
- [ ] "Users can delete own pending suggestions" (DELETE)
- [ ] "Admins can delete all suggestions" (DELETE)

#### 4️⃣ 데이터 샘플 조회
```sql
SELECT
  ws.id,
  ws.name,
  ws.status,
  ws.city_id,
  c.name as city_name,
  COUNT(*) OVER() as total_count
FROM workspace_suggestions ws
LEFT JOIN cities c ON ws.city_id = c.id
ORDER BY ws.created_at DESC
LIMIT 10;
```

#### 5️⃣ 승인된 제안 확인
```sql
SELECT
  ws.name as suggestion_name,
  ws.status,
  w.name as workspace_name,
  w.image_url,
  ws.approved_workspace_id
FROM workspace_suggestions ws
LEFT JOIN workspaces w ON ws.approved_workspace_id = w.id
WHERE ws.status = 'approved';
```

---

## Phase 6.3: Storage 검증

### Supabase Studio Storage 확인

#### 1️⃣ 버킷 확인
```
Storage → Buckets → workspaces
```
- [ ] 버킷이 공개(Public)로 설정됨
- [ ] 다음 폴더 구조:
  ```
  workspaces/
  ├── suggestions/
  │   └── {suggestion_id}/
  │       └── {timestamp}.{ext}
  └── approved/
      └── {workspace_id}/
          └── {timestamp}.{ext}
  ```

#### 2️⃣ 제안 이미지 파일
- [ ] `suggestions/` 폴더에 업로드된 이미지 존재
- [ ] 파일명: `{timestamp}.jpg`, `.png`, `.webp` 등
- [ ] 파일 크기: 0 ~ 5MB
- [ ] 메타데이터 확인:
  - Content-Type: `image/jpeg`, `image/png`, 등
  - Cache-Control: `3600` (1시간)

#### 3️⃣ 승인된 이미지 파일
- [ ] `approved/` 폴더에 복사된 이미지 존재
- [ ] 원본과 동일한 파일
- [ ] 파일 크기 및 메타데이터 일치
- [ ] public URL 접근 가능 (브라우저에서 열림)

#### 4️⃣ RLS 정책 확인
```
Storage → Policies → workspaces bucket
```
- [ ] "Users can upload suggestion images" (INSERT)
- [ ] "Anyone can view workspace images" (SELECT)
- [ ] "Admins can manage all images" (ALL)

---

## Phase 6.4: 통합 테스트 시나리오

### 전체 워크플로우 테스트

#### 시나리오 1: 완전한 제안 및 승인 프로세스
1. [ ] 일반 사용자 A가 이미지와 함께 제안 작성
2. [ ] A의 `/my-suggestions`에서 "검토 중" 상태 확인
3. [ ] Admin이 `/admin/suggestions`에서 제안 확인
4. [ ] Admin이 제안 승인
5. [ ] [ ] 새로운 작업공간이 생성됨 (`/admin/workspaces`에서 확인)
6. [ ] A의 `/my-suggestions`에서 상태가 "승인됨"으로 변경
7. [ ] Storage에서 이미지가 `approved/` 폴더로 복사됨
8. [ ] 새 작업공간의 이미지 URL이 public URL로 표시됨

#### 시나리오 2: 제안 거절 및 사용자 피드백
1. [ ] 일반 사용자 B가 이미지 없이 제안 작성
2. [ ] Admin이 제안 거절 (사유: "중복된 작업공간입니다")
3. [ ] B의 `/my-suggestions`에서 "거절됨" 상태 및 사유 확인
4. [ ] B가 거절된 제안 수정 불가 확인 (버튼 미표시)
5. [ ] B가 새로운 제안 작성 가능 (다시 `/suggest-workspace` 접속)

#### 시나리오 3: 권한 및 보안 검증
1. [ ] 비로그인 사용자가 `/suggest-workspace` 접속 → 리디렉션
2. [ ] 일반 사용자가 `/admin/suggestions` 접속 → 접근 거부
3. [ ] 일반 사용자가 `/api/admin/suggestions` 호출 → 403
4. [ ] 사용자 A가 사용자 B의 제안 조회 시도
   - API: `GET /api/suggestions` → B의 제안 미표시
   - DB (RLS): B의 제안 조회 불가
5. [ ] Admin이 모든 사용자의 제안 조회 → 성공

---

## Phase 6.5: 오류 처리 및 엣지 케이스

### 예상 오류 처리

#### 1️⃣ 이미지 업로드 오류
- [ ] **파일 형식 오류**: PDF, BMP 등 지원 안 함 → "JPG, PNG, WEBP 형식만 지원합니다"
- [ ] **파일 크기 오류**: 10MB 파일 → "파일 크기는 5MB 이하여야 합니다"
- [ ] **빈 파일**: 크기 0인 파일 → 스킵하고 정상 처리

#### 2️⃣ 네트워크 오류
- [ ] **Storage 업로드 실패**: DB에 제안이 저장되지 않음 (롤백)
- [ ] **DB 저장 실패**: 업로드된 이미지가 삭제됨 (정리)
- [ ] **승인 중 이미지 복사 실패**: 생성된 작업공간이 삭제됨

#### 3️⃣ 데이터 유효성 오류
- [ ] **필수 필드 누락**: 폼 제출 전 유효성 검사
- [ ] **중복된 이름**: (선택사항) 중복 체크
- [ ] **잘못된 좌표**: 범위 검증 (-90~90, -180~180)

#### 4️⃣ 동시성 문제
- [ ] **같은 제안 동시 승인**: 두 번째 승인 시도 → "이미 처리된 제안입니다"
- [ ] **이미지 동시 업로드**: 각각 다른 경로로 저장됨

---

## 테스트 실행 명령어

```bash
# 로컬 환경 전체 시작
npm run supabase:start
npm run dev

# 빌드 검증
npm run build

# 린트 및 타입 체크
npm run lint
npx tsc --noEmit

# 자동 테스트 실행
npm run test

# 특정 테스트 파일만 실행
npm run test -- test/api/suggestions.test.ts
```

---

## 성공 기준

✅ **Phase 6 완료 조건**:
- [ ] 모든 수동 테스트 체크리스트 완료
- [ ] 데이터베이스 검증 완료
- [ ] Storage 이미지 경로 확인
- [ ] 권한 및 RLS 정책 정상 작동
- [ ] 통합 테스트 시나리오 성공
- [ ] 오류 처리 정상 작동
- [ ] 빌드 성공 (0 에러)

---

## 다음 단계

### Phase 7: 배포 및 모니터링 (향후)
- Vercel에 자동 배포 설정
- Sentry로 오류 모니터링
- Analytics로 사용자 행동 추적
- Email 알림 추가 (승인/거절)

---

**작성일**: 2026-02-10
**마지막 수정**: 2026-02-10
