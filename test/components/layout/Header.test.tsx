/**
 * @vitest environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import Header from "@/components/layout/Header";
import { render } from "@testing-library/react";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Mock Supabase SSR client
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children }: any) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  ),
}));

// Mock UserMenu
vi.mock("@/components/layout/UserMenu", () => ({
  UserMenu: ({ userEmail }: any) => (
    <div data-testid="user-menu">
      <span data-testid="user-email">{userEmail}</span>
    </div>
  ),
}));

// Mock Button
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, size, ...props }: any) => (
    <button
      data-testid={`button-${variant}-${size}`}
      {...props}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

describe("components/layout/Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로그인 상태: UserMenu를 렌더링", async () => {
    const mockCookies = {
      getAll: vi.fn().mockReturnValue([]),
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
              email: "test@example.com",
            },
          },
          error: null,
        }),
      },
    };

    (cookies as any).mockResolvedValue(mockCookies);
    (createServerClient as any).mockReturnValue(mockSupabase);

    const { container } = render(await Header());

    expect(container.querySelector('[data-testid="user-menu"]')).toBeInTheDocument();
  });

  it("비로그인 상태: 로그인/회원가입 버튼을 렌더링", async () => {
    const mockCookies = {
      getAll: vi.fn().mockReturnValue([]),
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
          error: null,
        }),
      },
    };

    (cookies as any).mockResolvedValue(mockCookies);
    (createServerClient as any).mockReturnValue(mockSupabase);

    const { container } = render(await Header());

    const loginLink = container.querySelector('[data-testid="link-/login"]');
    const registerLink = container.querySelector('[data-testid="link-/register"]');

    expect(loginLink).toBeInTheDocument();
    expect(registerLink).toBeInTheDocument();
  });

  it("user.email이 없으면 로그인/회원가입 버튼을 렌더링", async () => {
    const mockCookies = {
      getAll: vi.fn().mockReturnValue([]),
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
              email: null, // email이 없는 경우
            },
          },
          error: null,
        }),
      },
    };

    (cookies as any).mockResolvedValue(mockCookies);
    (createServerClient as any).mockReturnValue(mockSupabase);

    const { container } = render(await Header());

    const registerLink = container.querySelector('[data-testid="link-/register"]');
    expect(registerLink).toBeInTheDocument();
  });

  it("로고 링크가 홈페이지로 향함", async () => {
    const mockCookies = {
      getAll: vi.fn().mockReturnValue([]),
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
          error: null,
        }),
      },
    };

    (cookies as any).mockResolvedValue(mockCookies);
    (createServerClient as any).mockReturnValue(mockSupabase);

    const { container } = render(await Header());

    const logoLink = container.querySelector('[data-testid="link-/"]');
    expect(logoLink).toBeInTheDocument();
  });

  it("createServerClient를 호출하여 Supabase 클라이언트 생성", async () => {
    const mockCookies = {
      getAll: vi.fn().mockReturnValue([]),
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
          error: null,
        }),
      },
    };

    (cookies as any).mockResolvedValue(mockCookies);
    (createServerClient as any).mockReturnValue(mockSupabase);

    await Header();

    expect(createServerClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
        }),
      })
    );
  });

  it("getUser()를 호출하여 현재 사용자 조회", async () => {
    const mockCookies = {
      getAll: vi.fn().mockReturnValue([]),
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
          error: null,
        }),
      },
    };

    (cookies as any).mockResolvedValue(mockCookies);
    (createServerClient as any).mockReturnValue(mockSupabase);

    await Header();

    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
  });

  it("로그인 상태일 때 UserMenu에 이메일 전달", async () => {
    const mockCookies = {
      getAll: vi.fn().mockReturnValue([]),
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
              email: "test@example.com",
            },
          },
          error: null,
        }),
      },
    };

    (cookies as any).mockResolvedValue(mockCookies);
    (createServerClient as any).mockReturnValue(mockSupabase);

    const { container } = render(await Header());

    expect(container.querySelector('[data-testid="user-email"]')).toHaveTextContent(
      "test@example.com"
    );
  });

  it("로고가 렌더링됨", async () => {
    const mockCookies = {
      getAll: vi.fn().mockReturnValue([]),
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
          error: null,
        }),
      },
    };

    (cookies as any).mockResolvedValue(mockCookies);
    (createServerClient as any).mockReturnValue(mockSupabase);

    const { container } = render(await Header());

    expect(container.textContent).toContain("노마드 도시");
  });
});
