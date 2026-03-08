# 배포 가이드

## GitHub Actions를 통한 Supabase 마이그레이션 자동 배포

### 📋 개요

main 브랜치에 푸시하면 자동으로 Supabase 프로덕션 데이터베이스에 마이그레이션이 적용됩니다.

### 🔐 필수 Secrets 설정

GitHub Repository Settings > Secrets and variables > Actions에서 다음 secrets를 추가해야 합니다:

#### 1. SUPABASE_ACCESS_TOKEN
**발급 방법:**
1. https://supabase.com/dashboard/account/tokens 접속
2. "Generate new token" 클릭
3. 토큰 이름: `github-actions-deploy`
4. 생성된 토큰 복사 (다시 볼 수 없으니 안전하게 저장)

**GitHub에 추가:**
```
Name: SUPABASE_ACCESS_TOKEN
Value: sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 2. PRODUCTION_PROJECT_ID
**확인 방법:**
- Supabase 프로젝트 URL에서 추출: `https://supabase.com/dashboard/project/{PROJECT_ID}`
- 현재 프로젝트: `usjxxxxxxxxxxxxx`

**GitHub에 추가:**
```
Name: PRODUCTION_PROJECT_ID
Value: usjxxxxxxxxxxxxx
```

#### 3. PRODUCTION_DB_PASSWORD
**확인 방법:**
1. Supabase Dashboard > Project Settings > Database
2. "Database password" 섹션에서 확인 또는 리셋

**GitHub에 추가:**
```
Name: PRODUCTION_DB_PASSWORD
Value: your_database_password
```

### 🚀 배포 방법

#### 자동 배포 (권장)
1. 새 마이그레이션 파일 생성:
   ```bash
   npm run supabase:migration:new your_migration_name
   ```

2. `supabase/migrations/` 폴더에 SQL 작성

3. 로컬에서 테스트:
   ```bash
   npm run supabase:reset
   npm run dev
   ```

4. Git에 커밋 및 푸시:
   ```bash
   git add supabase/migrations/
   git commit -m "Add migration: your_migration_name"
   git push origin main
   ```

5. GitHub Actions 탭에서 배포 진행 상황 확인

#### 수동 배포
긴급한 경우 GitHub Actions에서 수동으로 실행할 수 있습니다:

1. GitHub > Actions > "Deploy Migrations to Production" 워크플로우 선택
2. "Run workflow" 클릭
3. 입력란에 `deploy` 입력 (확인용)
4. "Run workflow" 버튼 클릭

### 📊 배포 프로세스

워크플로우는 다음 단계를 수행합니다:

1. **링크 연결**: Supabase 프로덕션 프로젝트에 연결
2. **마이그레이션 확인**: 적용 대기 중인 마이그레이션 목록 출력
3. **Dry Run**: 실제 적용 전 시뮬레이션
4. **배포**: 마이그레이션을 프로덕션 DB에 적용
5. **검증**: 적용 결과 확인

### ⚠️ 주의사항

#### 안전한 마이그레이션 작성
- **절대 하지 말아야 할 것:**
  - 프로덕션 데이터 삭제 (`DROP TABLE`, `DELETE FROM` 등)
  - NOT NULL 제약조건을 기존 컬럼에 추가 (데이터 없을 경우 실패)
  - 인덱스 없이 대용량 테이블 변경

- **권장 사항:**
  - 새 컬럼 추가 시 기본값 설정
  - 단계적 마이그레이션 (여러 파일로 나누기)
  - 로컬에서 충분히 테스트

#### 롤백 방법
마이그레이션은 기본적으로 롤백을 지원하지 않습니다. 문제 발생 시:

1. **새 마이그레이션으로 수정:**
   ```bash
   npm run supabase:migration:new fix_previous_migration
   ```

2. **이전 상태로 되돌리는 SQL 작성**

3. **다시 배포**

### 🔄 환경별 워크플로우

```
┌─────────────┐
│  로컬 개발   │  supabase start (로컬 PostgreSQL)
└─────────────┘
      │
      ▼
┌─────────────┐
│  PR 생성     │  CI 워크플로우 (lint, typecheck, 마이그레이션 테스트)
└─────────────┘
      │
      ▼
┌─────────────┐
│ main 머지    │  자동으로 프로덕션 마이그레이션 배포 (이 가이드)
└─────────────┘
      │
      ▼
┌─────────────┐
│ Vercel 배포  │  Vercel이 자동으로 빌드 및 배포
└─────────────┘
```

### 📝 트러블슈팅

#### "Error: Invalid access token"
- SUPABASE_ACCESS_TOKEN이 올바른지 확인
- 토큰이 만료되지 않았는지 확인 (https://supabase.com/dashboard/account/tokens)

#### "Error: Could not link project"
- PRODUCTION_PROJECT_ID가 올바른지 확인
- 토큰에 해당 프로젝트 접근 권한이 있는지 확인

#### "Migration failed"
- 로컬에서 `npm run supabase:reset` 실행하여 마이그레이션 테스트
- SQL 문법 오류 확인
- 프로덕션 데이터와 충돌하는 제약조건 확인

### 🔗 관련 링크

- [Supabase CLI 문서](https://supabase.com/docs/reference/cli)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [프로젝트 README](/README.md)
