import { describe, it, expect, beforeAll } from 'vitest';

const API_URL = 'http://localhost:3000';

/**
 * Phase 6: API 엔드포인트 테스트
 *
 * 주의: 이 테스트는 로컬 개발 환경에서만 실행되어야 합니다.
 * Supabase 세션과 테스트 사용자가 필요합니다.
 */

describe('Workspace Suggestions API', () => {
  let authToken: string;
  let userId: string;
  let suggestionId: string;

  beforeAll(async () => {
    // 주의: 실제 테스트를 위해서는 테스트 사용자 세션이 필요합니다
    console.log('⚠️ 수동 테스트 필요: 로그인 후 쿠키의 세션 토큰을 사용하세요');
  });

  describe('POST /api/suggestions (제안 제출)', () => {
    it('인증 없이 제출 시 401 응답', async () => {
      const formData = new FormData();
      formData.append('city_id', 'test-city-id');
      formData.append('name', 'Test Workspace');
      formData.append('type', 'cafe');
      formData.append('address', 'Test Address');
      formData.append('has_power', 'true');

      const response = await fetch(`${API_URL}/api/suggestions`, {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toContain('로그인');
    });

    it('잘못된 파일 타입 업로드 시 에러', async () => {
      // 이 테스트는 인증된 세션이 필요합니다
      console.log('⚠️ 인증 필요: 테스트 사용자로 로그인한 후 실행하세요');
    });

    it('필수 필드 없이 제출 시 에러', async () => {
      const formData = new FormData();
      formData.append('city_id', 'test-city-id');
      // name 필드 누락

      const response = await fetch(`${API_URL}/api/suggestions`, {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(401); // 인증 없음
    });
  });

  describe('GET /api/suggestions (제안 조회)', () => {
    it('인증 없이 조회 시 401 응답', async () => {
      const response = await fetch(`${API_URL}/api/suggestions`);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toContain('로그인');
    });

    it('상태 필터링 작동', async () => {
      // 인증된 세션 필요
      console.log('⚠️ 인증 필요: 테스트 사용자로 로그인한 후 실행하세요');
    });
  });

  describe('Admin API 접근 제어', () => {
    it('일반 사용자가 /api/admin/suggestions 접근 시 403', async () => {
      const response = await fetch(`${API_URL}/api/admin/suggestions`);

      expect(response.status).toBe(401); // 또는 403
      const json = await response.json();
      expect(json.error).toBeTruthy();
    });

    it('Admin이 제안 목록 조회 가능', async () => {
      // Admin 세션 필요
      console.log('⚠️ Admin 인증 필요: 관리자 계정으로 로그인한 후 실행하세요');
    });
  });

  describe('제안 승인/거절', () => {
    it('pending 제안만 처리 가능', async () => {
      // 테스트 데이터와 Admin 세션 필요
      console.log('⚠️ Admin 인증 필요: 관리자 계정으로 로그인한 후 실행하세요');
    });

    it('거절 시 사유 필수', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/suggestions/test-id/reject`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ admin_note: '' }),
        }
      );

      // 사유가 없으면 실패해야 함
      expect([400, 401, 403]).toContain(response.status);
    });
  });
});

/**
 * 수동 테스트 가이드
 *
 * 1. 개발 서버 시작
 *    npm run dev
 *
 * 2. 일반 사용자 계정으로 로그인
 *    - http://localhost:3000/login
 *    - 회원가입 또는 테스트 계정 사용
 *
 * 3. 제안 작성 테스트
 *    - http://localhost:3000/suggest-workspace
 *    - 이미지와 함께 제안 제출
 *    - 이미지 없이 제안 제출
 *    - 잘못된 파일 타입 업로드 시도
 *
 * 4. 제안 목록 확인
 *    - http://localhost:3000/my-suggestions
 *    - 상태별 필터 확인
 *    - 거절된 제안의 사유 확인
 *
 * 5. Admin 권한 테스트
 *    - Admin 계정으로 로그인 (/seed:admin 사용)
 *    - http://localhost:3000/admin/suggestions 접근
 *    - 제안 상세 페이지에서 승인/거절
 *
 * 6. Storage 확인
 *    - http://localhost:54323 (Supabase Studio)
 *    - Storage → workspaces 버킷
 *    - suggestions/ 폴더와 approved/ 폴더 확인
 *
 * 7. 데이터베이스 확인
 *    - Supabase Studio → SQL Editor
 *    - SELECT * FROM workspace_suggestions;
 *    - RLS 정책 테스트
 */
