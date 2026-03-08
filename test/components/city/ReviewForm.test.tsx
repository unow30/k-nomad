/**
 * @vitest environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ReviewForm from "@/components/city/ReviewForm";
import userEvent from "@testing-library/user-event";

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  PenLine: () => <svg data-testid="pen-icon" />,
  Star: ({ className }: any) => (
    <svg data-testid="star-icon" data-class={className} />
  ),
  Loader2: () => <svg data-testid="loader-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

// Mock Shadcn components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button {...props} onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ value, onChange, ...props }: any) => (
    <textarea
      {...props}
      value={value}
      onChange={onChange}
      data-testid="textarea"
    />
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ value, onChange, ...props }: any) => (
    <input
      {...props}
      value={value}
      onChange={onChange}
      data-testid="input"
    />
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: any) => <div data-testid="dialog" data-open={open}>{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
}));

describe("ReviewForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.alert = vi.fn();
  });

  it("리뷰 작성 버튼을 렌더링", () => {
    render(<ReviewForm cityId="city-1" cityName="서울" />);

    expect(screen.getByText("리뷰 작성하기")).toBeInTheDocument();
  });

  it("버튼 클릭 시 폼 다이얼로그를 열음", async () => {
    const user = userEvent.setup();
    render(<ReviewForm cityId="city-1" cityName="서울" />);

    const button = screen.getByText("리뷰 작성하기");
    await user.click(button);

    expect(screen.getByText("서울에 리뷰 작성하기")).toBeInTheDocument();
  });

  it("제목, 내용, 별점 입력 필드를 렌더링", async () => {
    const user = userEvent.setup();
    render(<ReviewForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("리뷰 작성하기"));

    expect(screen.getByTestId("input")).toBeInTheDocument();
    expect(screen.getByTestId("textarea")).toBeInTheDocument();
    expect(screen.getAllByTestId("star-icon").length).toBe(5);
  });

  it("빈 제목일 때 제출 방지", async () => {
    const user = userEvent.setup();
    render(<ReviewForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("리뷰 작성하기"));

    const textarea = screen.getByTestId("textarea");
    await user.type(textarea, "좋은 도시입니다");

    const submitButtons = screen.getAllByText("리뷰 제출하기");
    await user.click(submitButtons[submitButtons.length - 1]);

    expect(global.alert).toHaveBeenCalledWith("제목을 입력해주세요.");
  });

  it("빈 내용일 때 제출 방지", async () => {
    const user = userEvent.setup();
    render(<ReviewForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("리뷰 작성하기"));

    const input = screen.getByTestId("input");
    await user.type(input, "좋은 도시");

    const submitButtons = screen.getAllByText("리뷰 제출하기");
    await user.click(submitButtons[submitButtons.length - 1]);

    expect(global.alert).toHaveBeenCalledWith("리뷰 내용을 입력해주세요.");
  });

  it("별점 0일 때 제출 방지", async () => {
    const user = userEvent.setup();
    render(<ReviewForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("리뷰 작성하기"));

    const input = screen.getByTestId("input");
    const textarea = screen.getByTestId("textarea");

    await user.type(input, "좋은 도시");
    await user.type(textarea, "정말 좋은 도시입니다");

    const submitButtons = screen.getAllByText("리뷰 제출하기");
    await user.click(submitButtons[submitButtons.length - 1]);

    expect(global.alert).toHaveBeenCalledWith("별점을 선택해주세요.");
  });

  it("별점을 클릭하면 선택됨", async () => {
    const user = userEvent.setup();
    render(<ReviewForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("리뷰 작성하기"));

    // 첫 번째 별 클릭
    const stars = screen.getAllByTestId("star-icon");
    await user.click(stars[0].parentElement!);

    // 3번째 별 클릭
    await user.click(stars[2].parentElement!);

    expect(screen.getByText("3점")).toBeInTheDocument();
  });

  it("폼 제출 시 API 호출", async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "review-1" }),
    });

    render(<ReviewForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("리뷰 작성하기"));

    const input = screen.getByTestId("input");
    const textarea = screen.getByTestId("textarea");
    const stars = screen.getAllByTestId("star-icon");

    await user.type(input, "좋은 도시");
    await user.type(textarea, "정말 좋은 도시입니다");
    await user.click(stars[3].parentElement!); // 4점 선택

    const submitButtons = screen.getAllByText("리뷰 제출하기");
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/cities/city-1/reviews",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "좋은 도시",
            content: "정말 좋은 도시입니다",
            rating: 4,
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

    render(<ReviewForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("리뷰 작성하기"));

    const input = screen.getByTestId("input");
    const textarea = screen.getByTestId("textarea");
    const stars = screen.getAllByTestId("star-icon");

    await user.type(input, "좋은 도시");
    await user.type(textarea, "정말 좋은 도시입니다");
    await user.click(stars[3].parentElement!);

    const submitButtons = screen.getAllByText("리뷰 제출하기");
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText("로그인이 필요합니다")).toBeInTheDocument();
    });
  });

  it("취소 버튼 클릭 시 폼을 닫음", async () => {
    const user = userEvent.setup();
    render(<ReviewForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("리뷰 작성하기"));

    expect(screen.getByText("서울에 리뷰 작성하기")).toBeInTheDocument();

    const cancelButtons = screen.getAllByText("취소");
    await user.click(cancelButtons[0]);

    // 폼이 닫히는 것을 확인 (다이얼로그의 open 상태 확인)
    await waitFor(() => {
      const dialogs = screen.getAllByTestId("dialog");
      const reviewFormDialog = dialogs.find((d) =>
        d.textContent?.includes("서울에 리뷰 작성하기")
      );
      expect(reviewFormDialog).toHaveAttribute("data-open", "false");
    });
  });

  it("성공 시 onSuccess 콜백 호출", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "review-1" }),
    });

    render(
      <ReviewForm
        cityId="city-1"
        cityName="서울"
        onSuccess={onSuccess}
      />
    );

    await user.click(screen.getByText("리뷰 작성하기"));

    const input = screen.getByTestId("input");
    const textarea = screen.getByTestId("textarea");
    const stars = screen.getAllByTestId("star-icon");

    await user.type(input, "좋은 도시");
    await user.type(textarea, "정말 좋은 도시입니다");
    await user.click(stars[3].parentElement!);

    const submitButtons = screen.getAllByText("리뷰 제출하기");
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("네트워크 에러 처리", async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "서버 오류" }),
    });

    render(<ReviewForm cityId="city-1" cityName="서울" />);

    await user.click(screen.getByText("리뷰 작성하기"));

    const input = screen.getByTestId("input");
    const textarea = screen.getByTestId("textarea");
    const stars = screen.getAllByTestId("star-icon");

    await user.type(input, "좋은 도시");
    await user.type(textarea, "정말 좋은 도시입니다");
    await user.click(stars[3].parentElement!);

    const submitButtons = screen.getAllByText("리뷰 제출하기");
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("서버 오류");
    });
  });
});
