/**
 * @vitest environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WorkspaceReviewSection from "@/components/workspace/WorkspaceReviewSection";
import { WorkspaceReview } from "@/types/workspace";

vi.mock("@/components/workspace/WorkspaceReviewList", () => ({
  default: ({ reviews }: any) => (
    <div data-testid="review-list">
      {reviews.map((r: any) => (
        <div
          key={r.id}
          data-testid="review-item"
          data-rating={r.rating}
          data-date={r.createdAt}
          data-recommended={String(r.isRecommended)}
        >
          {r.title}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/workspace/WorkspaceReviewForm", () => ({
  default: ({ onSuccess }: any) => (
    <button data-testid="review-form" onClick={onSuccess}>
      리뷰 작성
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  Star: ({ className }: any) => (
    <span data-testid="star-icon" className={className} />
  ),
}));

const mockReload = vi.fn();
Object.defineProperty(window, "location", {
  value: { reload: mockReload },
  writable: true,
});

const makeReview = (overrides: Partial<WorkspaceReview>): WorkspaceReview => ({
  id: "r1",
  workspaceId: "ws-1",
  userId: "u1",
  title: "리뷰 제목",
  content: "리뷰 내용",
  rating: 3,
  isRecommended: false,
  createdAt: "2024-01-10T00:00:00Z",
  updatedAt: "2024-01-10T00:00:00Z",
  ...overrides,
});

const mockReviews: WorkspaceReview[] = [
  makeReview({
    id: "r1",
    title: "오래된 리뷰",
    rating: 3,
    isRecommended: false,
    createdAt: "2024-01-10T00:00:00Z",
  }),
  makeReview({
    id: "r2",
    title: "최신 리뷰",
    rating: 5,
    isRecommended: true,
    createdAt: "2024-01-20T00:00:00Z",
  }),
  makeReview({
    id: "r3",
    title: "중간 리뷰",
    rating: 2,
    isRecommended: false,
    createdAt: "2024-01-15T00:00:00Z",
  }),
];

const defaultProps = {
  reviews: mockReviews,
  workspaceId: "ws-1",
  workspaceName: "테스트 카페",
};

describe("WorkspaceReviewSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReload.mockClear();
  });

  describe("헤더 표시", () => {
    it("섹션 제목에 workspaceName 표시", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      expect(screen.getByText("✍️ 테스트 카페 리뷰")).toBeInTheDocument();
    });

    it("reviews 있을 때 평균 평점 표시 (소수점 1자리)", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      // (3 + 5 + 2) / 3 = 3.3333... → "3.3"
      expect(screen.getByText("3.3")).toBeInTheDocument();
    });

    it("reviews 있을 때 리뷰 개수 표시", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      expect(screen.getByText("3개의 리뷰")).toBeInTheDocument();
    });

    it("reviews=[] → 평점/개수 미표시", () => {
      render(<WorkspaceReviewSection {...defaultProps} reviews={[]} />);
      expect(screen.queryByText(/개의 리뷰/)).not.toBeInTheDocument();
      expect(screen.queryByTestId("star-icon")).not.toBeInTheDocument();
    });

    it("단일 리뷰의 평균 평점 올바르게 계산", () => {
      render(
        <WorkspaceReviewSection
          {...defaultProps}
          reviews={[makeReview({ id: "r1", rating: 4 })]}
        />
      );
      expect(screen.getByText("4.0")).toBeInTheDocument();
    });
  });

  describe("정렬 버튼", () => {
    it("reviews 있을 때 정렬 버튼 3개 표시", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      expect(screen.getByText("최신순")).toBeInTheDocument();
      expect(screen.getByText("평점순")).toBeInTheDocument();
      expect(screen.getByText("추천순")).toBeInTheDocument();
    });

    it("reviews=[] → 정렬 버튼 없음", () => {
      render(<WorkspaceReviewSection {...defaultProps} reviews={[]} />);
      expect(screen.queryByText("최신순")).not.toBeInTheDocument();
      expect(screen.queryByText("평점순")).not.toBeInTheDocument();
      expect(screen.queryByText("추천순")).not.toBeInTheDocument();
    });

    it("기본 정렬은 최신순 (createdAt 내림차순)", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      const items = screen.getAllByTestId("review-item");
      // r2(Jan 20) > r3(Jan 15) > r1(Jan 10) 순서
      expect(items[0]).toHaveTextContent("최신 리뷰");
      expect(items[1]).toHaveTextContent("중간 리뷰");
      expect(items[2]).toHaveTextContent("오래된 리뷰");
    });

    it("'평점순' 클릭 → rating 내림차순 정렬", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      fireEvent.click(screen.getByText("평점순"));
      const items = screen.getAllByTestId("review-item");
      // r2(5) > r1(3) > r3(2) 순서
      expect(items[0]).toHaveAttribute("data-rating", "5");
      expect(items[1]).toHaveAttribute("data-rating", "3");
      expect(items[2]).toHaveAttribute("data-rating", "2");
    });

    it("'추천순' 클릭 → isRecommended=true인 리뷰가 먼저", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      fireEvent.click(screen.getByText("추천순"));
      const items = screen.getAllByTestId("review-item");
      // r2(true) 먼저, 나머지는 날짜 내림차순
      expect(items[0]).toHaveAttribute("data-recommended", "true");
    });

    it("'추천순' 클릭 → isRecommended=false인 리뷰는 날짜 순으로", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      fireEvent.click(screen.getByText("추천순"));
      const items = screen.getAllByTestId("review-item");
      // r2(true, Jan20), r3(false, Jan15), r1(false, Jan10)
      expect(items[1]).toHaveTextContent("중간 리뷰");
      expect(items[2]).toHaveTextContent("오래된 리뷰");
    });

    it("정렬 버튼 클릭 후 해당 버튼이 active 스타일(bg-primary) 적용", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      const ratingBtn = screen.getByText("평점순");
      fireEvent.click(ratingBtn);
      expect(ratingBtn.className).toContain("bg-primary");
    });

    it("기본 상태에서 최신순 버튼이 active 스타일(bg-primary) 적용", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      const latestBtn = screen.getByText("최신순");
      expect(latestBtn.className).toContain("bg-primary");
    });

    it("다른 정렬 선택 시 이전 정렬 버튼 active 스타일 해제", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      const latestBtn = screen.getByText("최신순");
      const ratingBtn = screen.getByText("평점순");
      fireEvent.click(ratingBtn);
      expect(latestBtn.className).not.toContain("bg-primary");
    });
  });

  describe("리뷰 작성 폼", () => {
    it("WorkspaceReviewForm 렌더링", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      expect(screen.getByTestId("review-form")).toBeInTheDocument();
    });

    it("onSuccess 호출 시 onReviewUpdate prop 호출", () => {
      const onReviewUpdate = vi.fn();
      render(
        <WorkspaceReviewSection {...defaultProps} onReviewUpdate={onReviewUpdate} />
      );
      fireEvent.click(screen.getByTestId("review-form"));
      expect(onReviewUpdate).toHaveBeenCalledTimes(1);
    });

    it("onReviewUpdate 없으면 window.location.reload 호출", () => {
      render(<WorkspaceReviewSection {...defaultProps} />);
      fireEvent.click(screen.getByTestId("review-form"));
      expect(mockReload).toHaveBeenCalledTimes(1);
    });
  });

  describe("reviews prop 변경 시 반응", () => {
    it("reviews prop 변경 시 localReviews 업데이트", () => {
      const { rerender } = render(
        <WorkspaceReviewSection {...defaultProps} />
      );
      expect(screen.getByText("3개의 리뷰")).toBeInTheDocument();

      const newReviews = [makeReview({ id: "r1", title: "새 리뷰" })];
      rerender(
        <WorkspaceReviewSection {...defaultProps} reviews={newReviews} />
      );
      expect(screen.getByText("1개의 리뷰")).toBeInTheDocument();
    });

    it("reviews prop이 빈 배열로 변경되면 리뷰 카운터 미표시", () => {
      const { rerender } = render(
        <WorkspaceReviewSection {...defaultProps} />
      );
      rerender(<WorkspaceReviewSection {...defaultProps} reviews={[]} />);
      expect(screen.queryByText(/개의 리뷰/)).not.toBeInTheDocument();
    });
  });
});
