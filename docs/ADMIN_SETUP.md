# 관리자 계정 설정 가이드

seed 파일의 비밀번호로 로그인이 안 되는 문제를 해결하는 방법입니다.

## 문제 원인

Supabase는 GoTrue 인증 서비스를 사용하며, PostgreSQL의 `crypt()` 함수로 생성한 비밀번호 해시와 호환되지 않습니다. 따라서 `auth.users` 테이블에 직접 삽입하는 대신 **Supabase Admin API**를 사용해야 합니다.

## 해결 방법

### 1단계: Service Role Key 설정

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **Service Role Key 복사**
   - 좌측 메뉴에서 `Settings` > `API` 클릭
   - "Project API keys" 섹션에서 `service_role` secret key 찾기
   - 🔑 **"service_role (secret)"** 키 복사 (anon key가 아님!)

3. **환경 변수 설정**

   **옵션 1: .env 파일 사용 (권장 - 프로덕션 키)**
   ```bash
   # .env 파일에서 아래 줄의 주석을 제거하고 키 입력
   SUPABASE_SERVICE_ROLE_KEY=여기에_복사한_service_role_key_붙여넣기
   ```

   **옵션 2: .env.local 파일 사용 (로컬 Supabase용)**
   ```bash
   # .env.local 파일에 추가 (로컬 Supabase 사용 시)
   SUPABASE_SERVICE_ROLE_KEY=여기에_로컬_service_role_key_붙여넣기
   ```

   **환경 변수 우선순위:**
   - `.env.local` 파일이 있으면 최우선으로 사용됩니다
   - `.env.local`이 없으면 `.env` 파일을 사용합니다
   - 로컬 Supabase 개발 시에는 `.env.local` 사용을 권장합니다

   **⚠️ 주의사항:**
   - Service Role Key는 **모든 RLS 정책을 우회**하므로 절대 클라이언트 코드에 노출하지 마세요
   - `.env` 및 `.env.local` 파일은 `.gitignore`에 포함되어 있으므로 git에 커밋되지 않습니다

### 2단계: 관리자 계정 생성 스크립트 실행

```bash
npm run seed:admin
```

성공하면 다음과 같은 메시지가 표시됩니다:

```
✨ 관리자 계정 생성 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 이메일: admin001@test.ai
🔑 비밀번호: qwer1234(예시)
👤 이름: 관리자
🆔 User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
🔐 Role: admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 이제 로그인 페이지에서 위 정보로 로그인할 수 있습니다.
```

### 3단계: 로그인 테스트

1. 개발 서버 실행
   ```bash
   npm run dev
   ```

2. http://localhost:3000/login 접속

3. 다음 정보로 로그인
   - 이메일: `admin001@test.ai`
   - 비밀번호: `qwer1234(예시)`

## 대안 방법

### 방법 1: Supabase Dashboard에서 직접 생성

1. Supabase Dashboard > Authentication > Users
2. "Add user" 버튼 클릭
3. 이메일과 비밀번호 입력
4. "Create user" 클릭
5. 생성된 사용자의 UUID 복사
6. SQL Editor에서 admin 권한 부여:
   ```sql
   -- public.users 테이블에 프로필 생성
   INSERT INTO public.users (id, email, display_name, role)
   VALUES (
     '복사한_UUID',
     'admin001@test.ai',
     '관리자',
     'admin'
   );
   ```

### 방법 2: 회원가입 후 권한 변경

1. http://localhost:3000/register 에서 회원가입
2. SQL Editor에서 권한 변경:
   ```sql
   UPDATE public.users
   SET role = 'admin'
   WHERE email = '가입한_이메일';
   ```

## 트러블슈팅

### "환경 변수가 설정되지 않았습니다" 에러

- `.env` 또는 `.env.local` 파일에서 `SUPABASE_SERVICE_ROLE_KEY`의 주석이 제거되었는지 확인
- 키 값이 올바르게 입력되었는지 확인 (앞뒤 공백 없이)
- 로컬 Supabase 사용 시 `.env.local`에 키가 설정되어 있는지 확인
- 개발 서버를 재시작했는지 확인

### "기존 사용자 삭제 실패" 에러

- Supabase Dashboard > Authentication > Users 에서 기존 사용자를 수동으로 삭제
- 다시 스크립트 실행

### "프로필 생성 실패" 에러

- RLS 정책이 올바르게 설정되었는지 확인
- `public.users` 테이블이 존재하는지 확인
- 마이그레이션이 모두 적용되었는지 확인 (`npm run supabase:status`)

## 보안 주의사항

1. **Service Role Key 관리**
   - 절대 git에 커밋하지 마세요 (`.env`는 `.gitignore`에 포함됨)
   - 프로덕션 환경에서는 Vercel 환경 변수로 관리
   - 팀원과 공유 시 안전한 채널 사용 (1Password, LastPass 등)

2. **관리자 비밀번호 변경**
   - 프로덕션 배포 전 반드시 강력한 비밀번호로 변경
   - `qwer1234(예시)`는 개발 환경 전용 비밀번호입니다

3. **RLS 정책 확인**
   - 모든 테이블에 적절한 RLS 정책이 설정되었는지 확인
   - 관리자 권한이 과도하게 부여되지 않았는지 검토

## 참고 문서

- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-api)
- [Supabase RLS 정책](https://supabase.com/docs/guides/auth/row-level-security)
- [환경 변수 관리 Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
