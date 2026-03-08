# Supabase 마이그레이션 가이드라인

## 핵심 규칙

### ✅ DO - 올바른 마이그레이션 방법

1. **로컬에서 마이그레이션 생성**
   ```bash
   npm run supabase:migration:new <migration_name>
   ```

2. **마이그레이션 파일 작성**
   ```sql
   -- supabase/migrations/{timestamp}_{migration_name}.sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email TEXT NOT NULL UNIQUE
   );
   ```

3. **로컬에서 테스트**
   ```bash
   npm run supabase:start
   npm run dev
   ```

4. **Git 커밋 및 푸시**
   ```bash
   git add supabase/migrations/
   git commit -m "feat: 사용자 테이블 추가"
   git push origin main
   ```

5. **GitHub Actions가 자동 배포**
   - `.github/workflows/deploy-migrations.yml`이 자동으로 프로덕션에 배포
   - 배포 성공 여부는 GitHub Actions 탭에서 확인

### ❌ DON'T - 피해야 할 방법

1. **Supabase Dashboard SQL Editor에서 직접 DDL 실행 금지**
   ```sql
   -- ❌ Dashboard에서 직접 실행하지 마세요!
   CREATE TABLE direct_table (...);
   ALTER TABLE ...;
   ```

2. **프로덕션 DB에 직접 연결하여 스키마 변경 금지**
   ```bash
   # ❌ 절대 하지 마세요!
   psql "postgresql://postgres.xxx@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"
   ```

3. **로컬 마이그레이션 파일 수동 편집 후 재배포 금지**
   - 이미 적용된 마이그레이션 파일은 절대 수정하지 마세요
   - 새로운 마이그레이션 파일을 생성해야 합니다

## 긴급 상황 대응

### 프로덕션에서 긴급 핫픽스가 필요한 경우

**옳은 방법:**

1. **로컬에서 긴급 마이그레이션 생성**
   ```bash
   npm run supabase:migration:new hotfix_critical_issue
   ```

2. **긴급 SQL 작성**
   ```sql
   -- supabase/migrations/20260204140000_hotfix_critical_issue.sql
   ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
   UPDATE users SET email_verified = TRUE WHERE created_at < NOW() - INTERVAL '30 days';
   ```

3. **즉시 커밋 및 푸시**
   ```bash
   git add supabase/migrations/
   git commit -m "fix: 긴급 - 이메일 인증 필드 추가"
   git push origin main
   ```

4. **GitHub Actions에서 수동 트리거 (더 빠르게 배포)**
   - GitHub > Actions > "Deploy Migrations to Production"
   - "Run workflow" 클릭
   - "deploy" 입력 후 확인

**만약 Dashboard에서 이미 실행했다면:**

1. **즉시 로컬로 역포팅**
   ```bash
   npm run supabase:migration:new reverse_port_emergency_change
   ```

2. **실행한 SQL을 마이그레이션 파일에 복사**
   ```sql
   -- 이미 프로덕션에서 실행한 SQL을 여기에 복사
   ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
   ```

3. **커밋 및 푸시**
   ```bash
   git add supabase/migrations/
   git commit -m "fix: 긴급 변경사항 역포팅"
   git push origin main
   ```

## 마이그레이션 동기화 문제 해결

### 에러: "Remote migration versions not found"

**증상:**
```
Remote migration versions not found in local migrations directory.
supabase migration repair --status reverted 20260204010838 20260204011934
```

**원인:**
- 원격 DB에 로컬에 없는 마이그레이션이 존재
- 일반적으로 Dashboard에서 직접 SQL 실행 시 발생

**해결 방법 1: 자동 수정 (권장)**

GitHub Actions 워크플로우가 자동으로 처리:
```yaml
# .github/workflows/deploy-migrations.yml에 이미 추가됨
- name: Check migration sync
  run: |
    supabase migration repair --status reverted "$version"
```

**해결 방법 2: 수동 수정**

```bash
# 1. Supabase 프로젝트 연결
supabase link --project-ref usjxfwdibmgsitzqhajb

# 2. 원격 전용 마이그레이션 확인
supabase migration list

# 3. 원격 마이그레이션을 reverted 상태로 표시
supabase migration repair --status reverted 20260204010838 20260204011934

# 4. 다시 배포
supabase db push
```

## 마이그레이션 작성 모범 사례

### 1. 명확한 이름 사용
```bash
# ✅ Good
npm run supabase:migration:new add_user_email_verification
npm run supabase:migration:new create_reviews_table

# ❌ Bad
npm run supabase:migration:new update
npm run supabase:migration:new fix_db
```

### 2. 한 마이그레이션에 한 가지 목적
```sql
-- ✅ Good: 단일 테이블 변경
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- ❌ Bad: 여러 테이블을 한 번에 변경
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE cities ADD COLUMN featured BOOLEAN DEFAULT FALSE;
CREATE TABLE new_feature (...);
```

### 3. 롤백 가능하도록 작성
```sql
-- ✅ Good: IF NOT EXISTS 사용
CREATE TABLE IF NOT EXISTS reviews (...);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN;

-- ❌ Bad: 에러 발생 가능
CREATE TABLE reviews (...);
ALTER TABLE users ADD COLUMN verified BOOLEAN;
```

### 4. RLS (Row Level Security) 정책 함께 추가
```sql
-- 테이블 생성
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL
);

-- RLS 활성화
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS 정책 추가
CREATE POLICY "Users can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

## 로컬 개발 워크플로우

### 일일 개발 시작
```bash
# 1. 최신 코드 가져오기
git pull origin main

# 2. Supabase 로컬 시작
npm run supabase:start

# 3. 개발 서버 시작
npm run dev
```

### 스키마 변경 시
```bash
# 1. 마이그레이션 생성
npm run supabase:migration:new add_new_feature

# 2. SQL 파일 작성
# supabase/migrations/{timestamp}_add_new_feature.sql

# 3. 로컬 DB 재설정 (새 마이그레이션 적용)
npm run supabase:reset

# 4. TypeScript 타입 재생성
npm run supabase:gen:types

# 5. 테스트
npm run dev
npm run test
```

### 배포 전 체크리스트
- [ ] 로컬에서 마이그레이션 테스트 완료
- [ ] TypeScript 타입 업데이트 (`npm run supabase:gen:types`)
- [ ] RLS 정책 추가됨
- [ ] 마이그레이션 파일명이 명확함
- [ ] Git 커밋 메시지가 명확함

## 문제 해결

### 마이그레이션이 실패하는 경우

1. **로컬에서 먼저 테스트**
   ```bash
   npm run supabase:reset
   ```

2. **에러 로그 확인**
   ```bash
   supabase migration list
   ```

3. **새로운 마이그레이션으로 수정**
   ```bash
   npm run supabase:migration:new fix_previous_migration
   ```

### 로컬/원격 동기화 실패

1. **원격 상태 확인**
   ```bash
   supabase link --project-ref usjxfwdibmgsitzqhajb
   supabase migration list
   ```

2. **원격 전용 마이그레이션 제거**
   ```bash
   supabase migration repair --status reverted {version}
   ```

3. **재배포**
   ```bash
   git push origin main
   ```

## 추가 리소스

- [Supabase CLI 공식 문서](https://supabase.com/docs/guides/cli)
- [마이그레이션 가이드](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [GitHub Actions 워크플로우](.github/workflows/deploy-migrations.yml)
