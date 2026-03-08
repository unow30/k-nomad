import { vi } from "vitest";

/**
 * Supabase 클라이언트 Mock
 *
 * 사용 예시:
 * - createClient() 호출
 * - supabase.auth.getUser()
 * - supabase.auth.signInWithPassword(data)
 * - supabase.auth.signUp(data)
 * - supabase.auth.signOut()
 * - supabase.from('table').select().eq().maybeSingle()
 * - supabase.from('table').upsert()
 */

// Mock 데이터
export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  user_metadata: {},
  app_metadata: {},
};

// Supabase Auth Mock
const authMock = {
  getUser: vi.fn().mockResolvedValue({
    data: { user: mockUser },
    error: null,
  }),

  signInWithPassword: vi.fn().mockResolvedValue({
    data: { user: mockUser, session: {} },
    error: null,
  }),

  signUp: vi.fn().mockResolvedValue({
    data: { user: mockUser, session: {} },
    error: null,
  }),

  signOut: vi.fn().mockResolvedValue({
    data: {},
    error: null,
  }),
};

// Supabase Query Builder Mock
// from().select().eq().maybeSingle() 체이닝을 지원
function createQueryBuilder() {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    single: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    upsert: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
  };
}

// Supabase Client Mock
export const supabaseMock = {
  auth: authMock,

  from: vi.fn((table: string) => {
    return createQueryBuilder();
  }),

  // 테스트에서 사용할 reset 함수
  __reset: () => {
    authMock.getUser.mockClear();
    authMock.signInWithPassword.mockClear();
    authMock.signUp.mockClear();
    authMock.signOut.mockClear();
  },
};

// createClient 함수 mock
export const createClientMock = vi.fn().mockResolvedValue(supabaseMock);
