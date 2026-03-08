/**
 * @vitest environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import RegisterPage from "@/app/register/page";
import { render, screen } from "@testing-library/react";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children }: any) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  ),
}));

// Mock components
vi.mock("@/components/ui/input", () => ({
  Input: ({ ...props }: any) => <input {...props} data-testid="input" />,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardDescription: ({ children }: any) => <p data-testid="card-description">{children}</p>,
  CardTitle: ({ children }: any) => <h1 data-testid="card-title">{children}</h1>,
}));

vi.mock("@/components/auth/submit-button", () => ({
  SubmitButton: ({ children, pendingText }: any) => (
    <button data-testid="submit-button">{children}</button>
  ),
}));

// Mock auth action
vi.mock("@/app/actions/auth", () => ({
  signup: vi.fn(),
}));

describe("app/register/page (RegisterPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("회원가입 페이지를 렌더링", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByTestId("card-title")).toHaveTextContent("회원가입");
  });

  it("회원가입 폼을 렌더링", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    const inputs = screen.getAllByTestId("input");
    expect(inputs.length).toBeGreaterThanOrEqual(3); // email, password, confirmPassword
  });

  it("이메일 입력 필드를 렌더링", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    const inputs = screen.getAllByTestId("input");
    expect(inputs[0]).toHaveAttribute("type", "email");
    expect(inputs[0]).toHaveAttribute("name", "email");
  });

  it("비밀번호 입력 필드를 렌더링", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    const inputs = screen.getAllByTestId("input");
    expect(inputs[1]).toHaveAttribute("type", "password");
    expect(inputs[1]).toHaveAttribute("name", "password");
  });

  it("비밀번호 확인 입력 필드를 렌더링", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    const inputs = screen.getAllByTestId("input");
    expect(inputs[2]).toHaveAttribute("type", "password");
    expect(inputs[2]).toHaveAttribute("name", "confirmPassword");
  });

  it("제출 버튼을 렌더링", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  it("로그인 링크를 렌더링", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByText("로그인")).toBeInTheDocument();
  });

  it("이용약관 링크를 렌더링", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByText(/이용약관/)).toBeInTheDocument();
  });

  it("개인정보처리방침 링크를 렌더링", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByText(/개인정보처리방침/)).toBeInTheDocument();
  });

  it("에러 메시지를 표시", async () => {
    const errorMsg = "회원가입에 실패했습니다";
    const { container } = render(
      await RegisterPage({
        searchParams: Promise.resolve({
          error: encodeURIComponent(errorMsg),
        }),
      })
    );

    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it("비밀번호 요구사항을 표시", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByText("영문, 숫자를 포함하여 6자 이상")).toBeInTheDocument();
  });

  it("페이지 설명을 표시", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByText("노마드 라이프를 시작해보세요")).toBeInTheDocument();
  });

  it("로고를 표시", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByText("🏠")).toBeInTheDocument();
  });

  it("약관 동의 체크박스를 렌더링", async () => {
    const { container } = render(
      await RegisterPage({ searchParams: Promise.resolve({}) })
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThanOrEqual(2); // 약관, 마케팅
  });
});
