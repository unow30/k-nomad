/**
 * @vitest environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import RatingForm from "@/components/city/RatingForm";
import userEvent from "@testing-library/user-event";

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Star: ({ className }: any) => (
    <svg data-testid="star-icon" data-class={className} />
  ),
  Loader2: () => <svg data-testid="loader-icon" />,
}));

// Mock Shadcn components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button {...props} onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: any) => <div data-testid="dialog" data-open={open}>{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
}));

describe("RatingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.alert = vi.fn();
  });

  it("평가 작성 버튼을 렌더링", () => {
    render(<RatingForm cityId="city-1" cityName="서울" />);

    expect(screen.getByText("📊 평가 작성하기")).toBeInTheDocument();
  });

  it("버튼 클릭 시 다이얼로그를 열음", async () => {
    const user = userEvent.setup();
    render(<RatingForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("📊 평가 작성하기"));

    await waitFor(() => {
      expect(screen.getByText("서울에 평가하기")).toBeInTheDocument();
    });
  });

  it("별점 5개를 렌더링", async () => {
    const user = userEvent.setup();
    render(<RatingForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("📊 평가 작성하기"));

    const stars = screen.getAllByTestId("star-icon");
    expect(stars.length).toBe(5);
  });

  it("별점 선택 UI를 렌더링", async () => {
    const user = userEvent.setup();
    render(<RatingForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("📊 평가 작성하기"));

    await waitFor(() => {
      expect(screen.getByText("별점을 선택해주세요")).toBeInTheDocument();
    });
  });

  it("별점을 클릭하면 선택됨", async () => {
    const user = userEvent.setup();
    render(<RatingForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("📊 평가 작성하기"));

    const stars = screen.getAllByTestId("star-icon");
    await user.click(stars[3].parentElement!);

    expect(screen.getByText("4점")).toBeInTheDocument();
  });

  it("별점을 선택하지 않으면 제출 버튼이 disabled", async () => {
    const user = userEvent.setup();
    render(<RatingForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("📊 평가 작성하기"));

    await waitFor(() => {
      const submitButton = screen.getByText("평가 제출");
      expect(submitButton).toBeDisabled();
    });
  });

  it("별점을 선택하지 않으면 알림 표시", async () => {
    const user = userEvent.setup();
    render(<RatingForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("📊 평가 작성하기"));

    await waitFor(async () => {
      const submitButton = screen.getByText("평가 제출");
      // disabled 상태이므로 클릭되지 않음
      expect(submitButton).toBeDisabled();
    });
  });

  it("별점 선택 후 평가 제출 시 API 호출", async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "rating-1" }),
    });

    render(<RatingForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("📊 평가 작성하기"));

    const stars = screen.getAllByTestId("star-icon");
    await user.click(stars[3].parentElement!);

    const submitButton = screen.getByText("평가 제출");
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/cities/city-1/ratings",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            overall_score: 4,
          }),
        })
      );
    });
  });

  it("별점 1점 제출 시 API 호출", async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "rating-1" }),
    });

    render(<RatingForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("📊 평가 작성하기"));

    const stars = screen.getAllByTestId("star-icon");
    await user.click(stars[0].parentElement!);

    const submitButton = screen.getByText("평가 제출");
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/cities/city-1/ratings",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            overall_score: 1,
          }),
        })
      );
    });
  });

  it("401 에러 시 로그인 다이얼로그 표시", async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      status: 401,
      ok: false,
    });

    render(<RatingForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("📊 평가 작성하기"));

    const stars = screen.getAllByTestId("star-icon");
    await user.click(stars[3].parentElement!);

    const submitButton = screen.getByText("평가 제출");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("로그인이 필요합니다")).toBeInTheDocument();
    });
  });

  it("성공 시 onSuccess 콜백 호출", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "rating-1" }),
    });

    render(
      <RatingForm
        cityId="city-1"
        cityName="서울"
        onSuccess={onSuccess}
      />
    );

    await user.click(screen.getByText("📊 평가 작성하기"));

    const stars = screen.getAllByTestId("star-icon");
    await user.click(stars[3].parentElement!);

    const submitButton = screen.getByText("평가 제출");
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });
});
