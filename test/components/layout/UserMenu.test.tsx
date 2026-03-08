/**
 * @vitest environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserMenu } from "@/components/layout/UserMenu";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  User: () => <svg data-testid="user-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
}));

// Mock Shadcn components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick, ...props }: any) => (
    <div
      data-testid="dropdown-item"
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="separator" />,
}));

// Mock logout action
vi.mock("@/app/actions/auth", () => ({
  logout: vi.fn(),
}));

import { logout } from "@/app/actions/auth";

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("드롭다운 메뉴를 렌더링", () => {
    render(<UserMenu userEmail="test@example.com" />);

    expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
  });

  it("사용자 이메일을 표시", () => {
    render(<UserMenu userEmail="test@example.com" />);

    expect(screen.getAllByText("test@example.com").length).toBeGreaterThan(0);
  });

  it("프로필 링크를 렌더링", () => {
    const { container } = render(<UserMenu userEmail="test@example.com" />);

    const profileLink = container.querySelector('a[href="/profile"]');
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveTextContent("프로필");
  });

  it("로그아웃 버튼을 렌더링", () => {
    render(<UserMenu userEmail="test@example.com" />);

    expect(screen.getByText("로그아웃")).toBeInTheDocument();
  });

  it("로그아웃 버튼 클릭 시 logout() 호출", async () => {
    (logout as any).mockResolvedValue(undefined);

    render(<UserMenu userEmail="test@example.com" />);

    const logoutButton = screen.getByText("로그아웃");
    fireEvent.click(logoutButton);

    // logout이 호출되었는지 확인
    // Note: 실제로 비동기 호출이므로 완료를 기다려야 할 수 있음
    expect(logout).toHaveBeenCalled();
  });

  it("사용자 아이콘을 렌더링", () => {
    render(<UserMenu userEmail="test@example.com" />);

    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
  });

  it("계정 정보 섹션을 표시", () => {
    render(<UserMenu userEmail="test@example.com" />);

    expect(screen.getByText("계정")).toBeInTheDocument();
  });

  it("다양한 이메일 형식을 처리", () => {
    const emails = [
      "user@example.com",
      "test.name@company.co.kr",
      "admin+test@domain.org",
    ];

    emails.forEach((email) => {
      const { unmount } = render(<UserMenu userEmail={email} />);

      expect(screen.getByText(email, { selector: 'p' })).toBeInTheDocument();

      unmount();
    });
  });
});
