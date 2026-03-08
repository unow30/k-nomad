/**
 * @vitest environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation with vi.hoisted
const { mockPush, mockUseRouter, mockUseSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUseRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  mockUseSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("next/navigation", () => ({
  useRouter: mockUseRouter,
  useSearchParams: mockUseSearchParams,
}));

import FilterBar from "@/components/filters/FilterBar";

// Mock Select 컴포넌트 (Radix UI)
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => (
    <div data-testid="select-root">
      {children}
      <input
        type="hidden"
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        disabled={disabled}
      />
    </div>
  ),
  SelectTrigger: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
}));

// Mock Input 컴포넌트
vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

// Mock Button 컴포넌트
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe("FilterBar", () => {
  let mockRouterPush: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterPush = vi.fn();
    mockUseRouter.mockReturnValue({ push: mockRouterPush });
  });

  describe("렌더링", () => {
    it("모든 필터 옵션이 렌더링되어야 함", () => {
      render(<FilterBar />);

      // 레이블 확인
      expect(screen.getByText("정렬")).toBeInTheDocument();
      expect(screen.getByText("지역")).toBeInTheDocument();
      expect(screen.getByText("월 생활비")).toBeInTheDocument();
      expect(screen.getByText("환경 특성")).toBeInTheDocument();
      expect(screen.getByText("최고 계절")).toBeInTheDocument();
    });

    it("검색 입력 필드가 렌더링되어야 함", () => {
      render(<FilterBar />);

      const searchInput = screen.getByPlaceholderText("도시 이름으로 검색...");
      expect(searchInput).toBeInTheDocument();
    });

    it("기본값으로 정렬이 'score'로 설정", () => {
      render(<FilterBar initialSort="score" />);

      const selects = screen.getAllByTestId("select-root");
      const hidden = selects[0].querySelector("input[type='hidden']") as HTMLInputElement;
      expect(hidden.value).toBe("score");
    });

    it("기본값으로 지역이 'all'로 설정", () => {
      render(<FilterBar initialRegion="all" />);

      const selects = screen.getAllByTestId("select-root");
      const hidden = selects[1].querySelector("input[type='hidden']") as HTMLInputElement;
      expect(hidden.value).toBe("all");
    });
  });

  describe("검색 기능", () => {
    it("검색어 입력 후 form submit", async () => {
      const user = userEvent.setup();

      render(<FilterBar />);

      const searchInput = screen.getByPlaceholderText(
        "도시 이름으로 검색..."
      ) as HTMLInputElement;

      // 검색어 입력
      await user.type(searchInput, "서울");

      // form submit
      const form = searchInput.closest("form");
      expect(form).toBeInTheDocument();
      if (form) {
        await user.click(screen.getByPlaceholderText("도시 이름으로 검색..."));
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          await user.click(submitButton);
        } else {
          form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        }
      }

      // URL에 search 파라미터가 추가되어야 함
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalled();
      });
    });

    it("빈 검색어는 search 파라미터 제거", async () => {
      const user = userEvent.setup();

      render(<FilterBar initialSearch="기존검색어" />);

      const searchInput = screen.getByPlaceholderText(
        "도시 이름으로 검색..."
      ) as HTMLInputElement;

      // 검색어 클리어
      await user.clear(searchInput);

      // form submit
      const form = searchInput.closest("form");
      expect(form).toBeInTheDocument();
      if (form) {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalled();
      });
    });
  });

  describe("필터 선택", () => {
    it("정렬 필터 선택 시 URL 업데이트", async () => {
      const user = userEvent.setup();

      render(<FilterBar />);

      // select 컴포넌트의 input 값 변경
      const selects = screen.getAllByTestId("select-root");
      const sortSelect = selects[0].querySelector("input[type='hidden']") as HTMLInputElement;

      // 값 변경
      sortSelect.value = "budget-low";
      sortSelect.dispatchEvent(new Event("change", { bubbles: true }));

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalled();
      });
    });

    it("지역 필터 선택 시 URL 업데이트", async () => {
      const user = userEvent.setup();

      render(<FilterBar />);

      const selects = screen.getAllByTestId("select-root");
      const regionSelect = selects[1].querySelector("input[type='hidden']") as HTMLInputElement;

      regionSelect.value = "gangwon";
      regionSelect.dispatchEvent(new Event("change", { bubbles: true }));

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalled();
      });
    });
  });

  describe("초기 상태", () => {
    it("초기 정렬값이 설정됨", () => {
      render(<FilterBar initialSort="budget-high" />);

      const selects = screen.getAllByTestId("select-root");
      const hidden = selects[0].querySelector("input[type='hidden']") as HTMLInputElement;
      expect(hidden.value).toBe("budget-high");
    });

    it("초기 지역값이 설정됨", () => {
      render(<FilterBar initialRegion="jeju" />);

      const selects = screen.getAllByTestId("select-root");
      const hidden = selects[1].querySelector("input[type='hidden']") as HTMLInputElement;
      expect(hidden.value).toBe("jeju");
    });

    it("초기 예산값이 설정됨", () => {
      render(<FilterBar initialBudget="100to200" />);

      const selects = screen.getAllByTestId("select-root");
      const hidden = selects[2].querySelector("input[type='hidden']") as HTMLInputElement;
      expect(hidden.value).toBe("100to200");
    });

    it("초기 환경값이 설정됨", () => {
      render(<FilterBar initialEnvironment="cafe" />);

      const selects = screen.getAllByTestId("select-root");
      const hidden = selects[3].querySelector("input[type='hidden']") as HTMLInputElement;
      expect(hidden.value).toBe("cafe");
    });

    it("초기 계절값이 설정됨", () => {
      render(<FilterBar initialSeason="spring" />);

      const selects = screen.getAllByTestId("select-root");
      const hidden = selects[4].querySelector("input[type='hidden']") as HTMLInputElement;
      expect(hidden.value).toBe("spring");
    });

    it("초기 검색어가 설정됨", () => {
      render(<FilterBar initialSearch="강원" />);

      const searchInput = screen.getByPlaceholderText(
        "도시 이름으로 검색..."
      ) as HTMLInputElement;
      expect(searchInput.value).toBe("강원");
    });
  });

  describe("여러 필터 조합", () => {
    it("모든 필터가 초기값으로 설정됨", () => {
      render(
        <FilterBar
          initialSort="internet"
          initialRegion="gangwon"
          initialBudget="under100"
          initialEnvironment="nature"
          initialSeason="winter"
          initialSearch="원주"
        />
      );

      // 검색어 확인
      const searchInput = screen.getByPlaceholderText(
        "도시 이름으로 검색..."
      ) as HTMLInputElement;
      expect(searchInput.value).toBe("원주");

      // select 값들 확인
      const selects = screen.getAllByTestId("select-root");
      expect((selects[0].querySelector("input[type='hidden']") as HTMLInputElement).value).toBe("internet");
      expect((selects[1].querySelector("input[type='hidden']") as HTMLInputElement).value).toBe("gangwon");
      expect((selects[2].querySelector("input[type='hidden']") as HTMLInputElement).value).toBe("under100");
      expect((selects[3].querySelector("input[type='hidden']") as HTMLInputElement).value).toBe("nature");
      expect((selects[4].querySelector("input[type='hidden']") as HTMLInputElement).value).toBe("winter");
    });
  });
});
