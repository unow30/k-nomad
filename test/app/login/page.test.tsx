/**
 * @vitest environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import LoginPage from "@/app/login/page";
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
  login: vi.fn(),
}));

describe("app/login/page (LoginPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로그인 페이지를 렌더링", async () => {
    const { container } = render(
      await LoginPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByTestId("card-title")).toHaveTextContent("로그인");
  });

  it("로그인 폼을 렌더링", async () => {
    const { container } = render(
      await LoginPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getAllByTestId("input").length).toBeGreaterThanOrEqual(2);
  });

  it("이메일 입력 필드를 렌더링", async () => {
    const { container } = render(
      await LoginPage({ searchParams: Promise.resolve({}) })
    );

    const inputs = screen.getAllByTestId("input");
    expect(inputs[0]).toHaveAttribute("type", "email");
    expect(inputs[0]).toHaveAttribute("name", "email");
  });

  it("비밀번호 입력 필드를 렌더링", async () => {
    const { container } = render(
      await LoginPage({ searchParams: Promise.resolve({}) })
    );

    const inputs = screen.getAllByTestId("input");
    expect(inputs[1]).toHaveAttribute("type", "password");
    expect(inputs[1]).toHaveAttribute("name", "password");
  });

  it("제출 버튼을 렌더링", async () => {
    const { container } = render(
      await LoginPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  it("회원가입 링크를 렌더링", async () => {
    const { container } = render(
      await LoginPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByText("회원가입")).toBeInTheDocument();
  });

  it("비밀번호 찾기 링크를 렌더링", async () => {
    const { container } = render(
      await LoginPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByText("비밀번호 찾기")).toBeInTheDocument();
  });

  it("에러 메시지를 표시", async () => {
    const errorMsg = "로그인에 실패했습니다";
    const { container } = render(
      await LoginPage({
        searchParams: Promise.resolve({
          error: encodeURIComponent(errorMsg),
        }),
      })
    );

    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it("성공 메시지를 표시", async () => {
    const successMsg = "회원가입이 완료되었습니다";
    const { container } = render(
      await LoginPage({
        searchParams: Promise.resolve({
          message: encodeURIComponent(successMsg),
        }),
      })
    );

    expect(screen.getByText(successMsg)).toBeInTheDocument();
  });

  it("페이지 설명을 표시", async () => {
    const { container } = render(
      await LoginPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByText("대한민국 노마드 도시에 오신 것을 환영합니다")).toBeInTheDocument();
  });

  it("로고를 표시", async () => {
    const { container } = render(
      await LoginPage({ searchParams: Promise.resolve({}) })
    );

    expect(screen.getByText("🏠")).toBeInTheDocument();
  });
});
