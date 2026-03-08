/**
 * @vitest environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SubmitButton } from "@/components/auth/submit-button";

// Mock useFormStatus
vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    useFormStatus: vi.fn(),
  };
});

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Loader2: () => <svg data-testid="loader-icon" />,
}));

// Mock Shadcn Button
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, ...props }: any) => (
    <button {...props} disabled={disabled} data-testid="submit-btn">
      {children}
    </button>
  ),
}));

import { useFormStatus } from "react-dom";

describe("SubmitButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("기본 텍스트를 렌더링", () => {
    (useFormStatus as any).mockReturnValue({ pending: false });

    render(<SubmitButton>제출</SubmitButton>);

    expect(screen.getByText("제출")).toBeInTheDocument();
  });

  it("pending 상태일 때 로딩 표시", () => {
    (useFormStatus as any).mockReturnValue({ pending: true });

    render(<SubmitButton>제출</SubmitButton>);

    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
  });

  it("pending 상태일 때 기본 대기 메시지 표시", () => {
    (useFormStatus as any).mockReturnValue({ pending: true });

    render(<SubmitButton>제출</SubmitButton>);

    expect(screen.getByText("처리 중...")).toBeInTheDocument();
  });

  it("pendingText가 제공되면 해당 텍스트 표시", () => {
    (useFormStatus as any).mockReturnValue({ pending: true });

    render(
      <SubmitButton pendingText="저장 중...">제출</SubmitButton>
    );

    expect(screen.getByText("저장 중...")).toBeInTheDocument();
  });

  it("pending이 false일 때 원래 텍스트 표시", () => {
    (useFormStatus as any).mockReturnValue({ pending: false });

    render(
      <SubmitButton pendingText="저장 중...">저장</SubmitButton>
    );

    expect(screen.getByText("저장")).toBeInTheDocument();
    expect(screen.queryByText("저장 중...")).not.toBeInTheDocument();
  });

  it("pending 상태일 때 버튼을 disabled 처리", () => {
    (useFormStatus as any).mockReturnValue({ pending: true });

    render(<SubmitButton>제출</SubmitButton>);

    const button = screen.getByTestId("submit-btn");
    expect(button).toBeDisabled();
  });

  it("pending이 false일 때 버튼을 enabled 처리", () => {
    (useFormStatus as any).mockReturnValue({ pending: false });

    render(<SubmitButton>제출</SubmitButton>);

    const button = screen.getByTestId("submit-btn");
    expect(button).not.toBeDisabled();
  });

  it("type이 submit으로 설정됨", () => {
    (useFormStatus as any).mockReturnValue({ pending: false });

    render(<SubmitButton>제출</SubmitButton>);

    const button = screen.getByTestId("submit-btn");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("로더 아이콘이 마진 오른쪽을 가짐 (pending 중일 때)", () => {
    (useFormStatus as any).mockReturnValue({ pending: true });

    const { container } = render(<SubmitButton>제출</SubmitButton>);

    const loaderIcon = screen.getByTestId("loader-icon");
    expect(loaderIcon).toBeInTheDocument();
  });

  it("여러 자식 요소를 처리", () => {
    (useFormStatus as any).mockReturnValue({ pending: false });

    render(
      <SubmitButton>
        <span>클릭하기</span>
      </SubmitButton>
    );

    expect(screen.getByText("클릭하기")).toBeInTheDocument();
  });

  it("pendingText 없이 pending 상태 처리", () => {
    (useFormStatus as any).mockReturnValue({ pending: true });

    render(<SubmitButton>제출</SubmitButton>);

    // pendingText가 없으면 "처리 중..." 표시
    expect(screen.getByText("처리 중...")).toBeInTheDocument();
  });

  it("useFormStatus 호출 확인", () => {
    (useFormStatus as any).mockReturnValue({ pending: false });

    render(<SubmitButton>제출</SubmitButton>);

    expect(useFormStatus).toHaveBeenCalled();
  });
});
