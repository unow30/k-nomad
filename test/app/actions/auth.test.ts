import { describe, it, expect, beforeEach, vi } from "vitest";
import { login, signup, logout } from "@/app/actions/auth";

// Mock 정의
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const error = new Error(`NEXT_REDIRECT: ${url}`);
    (error as any).digest = "NEXT_REDIRECT";
    throw error;
  }),
}));

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Mock 유틸리티
function createFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

describe("app/actions/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login()", () => {
    it("성공적으로 로그인하고 / 로 리다이렉트", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1", email: "test@example.com" } },
            error: null,
          }),
        },
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const formData = createFormData({
        email: "test@example.com",
        password: "password123",
      });

      // redirect는 throw Error를 통해 구현됨
      await expect(login(formData)).rejects.toThrow("NEXT_REDIRECT: /");

      // 확인: signInWithPassword 호출됨
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });

      // 확인: revalidatePath 호출됨
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("이메일이 잘못되면 에러 페이지로 리다이렉트", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: null,
            error: {
              message: "Invalid credentials",
            },
          }),
        },
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const formData = createFormData({
        email: "wrong@example.com",
        password: "wrongpassword",
      });

      const errorMessage = encodeURIComponent(
        "이메일 또는 비밀번호가 올바르지 않습니다"
      );

      await expect(login(formData)).rejects.toThrow(
        `NEXT_REDIRECT: /login?error=${errorMessage}`
      );
    });

    it("빈 이메일/비밀번호를 처리", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: null,
            error: {
              message: "Invalid credentials",
            },
          }),
        },
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const formData = createFormData({
        email: "",
        password: "",
      });

      await expect(login(formData)).rejects.toThrow("NEXT_REDIRECT");
    });
  });

  describe("signup()", () => {
    it("성공적으로 회원가입하고 루트로 리다이렉트", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValue({
            data: { user: { id: "new-user", email: "new@example.com" } },
            error: null,
          }),
        },
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const formData = createFormData({
        email: "new@example.com",
        password: "newpassword123",
      });

      await expect(signup(formData)).rejects.toThrow("NEXT_REDIRECT: /");

      // 확인: signUp 호출됨
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "newpassword123",
      });

      // 확인: revalidatePath 호출됨
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("중복된 이메일로 회원가입 시 에러 페이지로 리다이렉트", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValue({
            data: null,
            error: {
              message: "User already exists",
            },
          }),
        },
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const formData = createFormData({
        email: "existing@example.com",
        password: "password123",
      });

      const errorMessage = encodeURIComponent(
        "회원가입에 실패했습니다. 다시 시도해주세요"
      );

      await expect(signup(formData)).rejects.toThrow(
        `NEXT_REDIRECT: /register?error=${errorMessage}`
      );
    });
  });

  describe("logout()", () => {
    it("성공적으로 로그아웃하고 /login 으로 리다이렉트", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({
            data: {},
            error: null,
          }),
        },
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      await expect(logout()).rejects.toThrow("NEXT_REDIRECT: /login");

      // 확인: signOut 호출됨
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();

      // 확인: revalidatePath 호출됨
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("로그아웃 실패 시 에러 메시지와 함께 리다이렉트", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({
            data: null,
            error: {
              message: "Logout failed",
            },
          }),
        },
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      await expect(logout()).rejects.toThrow(
        "NEXT_REDIRECT: /?error=로그아웃에 실패했습니다"
      );
    });
  });
});
