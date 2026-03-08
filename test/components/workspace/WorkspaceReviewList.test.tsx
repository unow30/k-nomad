/**
 * @vitest environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WorkspaceReviewList from "@/components/workspace/WorkspaceReviewList";
import { WorkspaceReview } from "@/types/workspace";

vi.mock("@/components/workspace/ImageGalleryModal", () => ({
  default: ({ open, initialIndex }: any) =>
    open ? (
      <div data-testid="gallery-modal" data-index={initialIndex} />
    ) : null,
}));

vi.mock("@/components/workspace/WorkspaceReviewEditForm", () => ({
  default: ({ open, reviewId }: any) =>
    open ? (
      <div data-testid="edit-form" data-review-id={reviewId} />
    ) : null,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, title, size, variant, className, ...props }: any) => (
    <button onClick={onClick} title={title} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  Star: ({ className }: any) => <span data-testid="star" className={className} />,
  MessageCircle: () => <span data-testid="message-circle" />,
  User: () => <span data-testid="user-icon" />,
  Pencil: () => <span data-testid="pencil-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
}));

// global mock
global.fetch = vi.fn();
global.confirm = vi.fn();
global.alert = vi.fn();

const makeReview = (overrides: Partial<WorkspaceReview> = {}): WorkspaceReview => ({
  id: "review-1",
  workspaceId: "ws-1",
  userId: "user-1",
  title: "좋은 카페",
  content: "작업하기 좋은 환경입니다.",
  rating: 4,
  isRecommended: false,
  author: { username: "홍길동" },
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
  ...overrides,
});

describe("WorkspaceReviewList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    (global.confirm as any).mockReturnValue(true);
  });

  describe("로딩 상태", () => {
    it("isLoading=true → 스켈레톤 3개 (animate-pulse) 표시", () => {
      render(<WorkspaceReviewList reviews={[]} isLoading={true} />);
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBe(3);
    });
  });

  describe("빈 상태", () => {
    it("reviews=[] → 빈 상태 메시지 표시", () => {
      render(<WorkspaceReviewList reviews={[]} />);
      expect(screen.getByText("아직 리뷰가 없습니다.")).toBeInTheDocument();
    });
  });

  describe("리뷰 표시", () => {
    it("리뷰 제목 표시", () => {
      render(<WorkspaceReviewList reviews={[makeReview()]} />);
      expect(screen.getByText("좋은 카페")).toBeInTheDocument();
    });

    it("리뷰 내용 표시", () => {
      render(<WorkspaceReviewList reviews={[makeReview()]} />);
      expect(
        screen.getByText("작업하기 좋은 환경입니다.")
      ).toBeInTheDocument();
    });

    it("리뷰 평점 표시 (rating.0 형식)", () => {
      render(<WorkspaceReviewList reviews={[makeReview({ rating: 4 })]} />);
      expect(screen.getByText("4.0")).toBeInTheDocument();
    });

    it("작성자명 표시", () => {
      render(<WorkspaceReviewList reviews={[makeReview()]} />);
      expect(screen.getByText("홍길동")).toBeInTheDocument();
    });

    it("author 없으면 '익명' 표시", () => {
      render(
        <WorkspaceReviewList
          reviews={[makeReview({ author: undefined })]}
        />
      );
      expect(screen.getByText("익명")).toBeInTheDocument();
    });

    it("author.username 없으면 '익명' 표시", () => {
      render(
        <WorkspaceReviewList
          reviews={[makeReview({ author: { username: undefined } })]}
        />
      );
      expect(screen.getByText("익명")).toBeInTheDocument();
    });

    it("isRecommended=true → '✅ 추천' 배지 표시", () => {
      render(
        <WorkspaceReviewList
          reviews={[makeReview({ isRecommended: true })]}
        />
      );
      expect(screen.getByText("✅ 추천")).toBeInTheDocument();
    });

    it("isRecommended=false → 추천 배지 미표시", () => {
      render(
        <WorkspaceReviewList
          reviews={[makeReview({ isRecommended: false })]}
        />
      );
      expect(screen.queryByText("✅ 추천")).not.toBeInTheDocument();
    });

    it("여러 리뷰 표시", () => {
      const reviews = [
        makeReview({ id: "r1", title: "첫 번째 리뷰" }),
        makeReview({ id: "r2", title: "두 번째 리뷰" }),
      ];
      render(<WorkspaceReviewList reviews={reviews} />);
      expect(screen.getByText("첫 번째 리뷰")).toBeInTheDocument();
      expect(screen.getByText("두 번째 리뷰")).toBeInTheDocument();
    });
  });

  describe("수정/삭제 버튼 권한", () => {
    it("isAdmin=true → 수정/삭제 버튼 표시", () => {
      render(
        <WorkspaceReviewList reviews={[makeReview()]} isAdmin={true} />
      );
      expect(screen.getByTitle("리뷰 수정")).toBeInTheDocument();
      expect(screen.getByTitle("리뷰 삭제")).toBeInTheDocument();
    });

    it("review.userId === currentUserId → 수정/삭제 버튼 표시", () => {
      render(
        <WorkspaceReviewList
          reviews={[makeReview({ userId: "user-1" })]}
          currentUserId="user-1"
        />
      );
      expect(screen.getByTitle("리뷰 수정")).toBeInTheDocument();
      expect(screen.getByTitle("리뷰 삭제")).toBeInTheDocument();
    });

    it("다른 사람 리뷰 + 비관리자 → 수정/삭제 버튼 없음", () => {
      render(
        <WorkspaceReviewList
          reviews={[makeReview({ userId: "user-other" })]}
          currentUserId="user-1"
          isAdmin={false}
        />
      );
      expect(screen.queryByTitle("리뷰 수정")).not.toBeInTheDocument();
      expect(screen.queryByTitle("리뷰 삭제")).not.toBeInTheDocument();
    });

    it("currentUserId 미제공 + 비관리자 → 수정/삭제 버튼 없음", () => {
      render(<WorkspaceReviewList reviews={[makeReview()]} isAdmin={false} />);
      expect(screen.queryByTitle("리뷰 수정")).not.toBeInTheDocument();
      expect(screen.queryByTitle("리뷰 삭제")).not.toBeInTheDocument();
    });
  });

  describe("수정 폼", () => {
    it("수정 버튼 클릭 → edit-form 모달 열림", () => {
      render(
        <WorkspaceReviewList reviews={[makeReview()]} isAdmin={true} />
      );
      expect(screen.queryByTestId("edit-form")).not.toBeInTheDocument();
      fireEvent.click(screen.getByTitle("리뷰 수정"));
      expect(screen.getByTestId("edit-form")).toBeInTheDocument();
    });

    it("수정 버튼 클릭 시 해당 리뷰 ID로 폼 열림", () => {
      render(
        <WorkspaceReviewList
          reviews={[makeReview({ id: "review-abc" })]}
          isAdmin={true}
        />
      );
      fireEvent.click(screen.getByTitle("리뷰 수정"));
      expect(screen.getByTestId("edit-form")).toHaveAttribute(
        "data-review-id",
        "review-abc"
      );
    });
  });

  describe("삭제 처리", () => {
    it("삭제 버튼 클릭 → window.confirm 호출", async () => {
      render(
        <WorkspaceReviewList reviews={[makeReview()]} isAdmin={true} />
      );
      fireEvent.click(screen.getByTitle("리뷰 삭제"));
      expect(global.confirm).toHaveBeenCalledWith("리뷰를 삭제하시겠습니까?");
    });

    it("confirm=false → fetch 미호출", async () => {
      (global.confirm as any).mockReturnValue(false);
      render(
        <WorkspaceReviewList reviews={[makeReview()]} isAdmin={true} />
      );
      fireEvent.click(screen.getByTitle("리뷰 삭제"));
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("confirm=true → DELETE /api/workspaces/{workspaceId}/reviews/{reviewId} 호출", async () => {
      render(
        <WorkspaceReviewList
          reviews={[makeReview({ id: "r1", workspaceId: "ws-1" })]}
          isAdmin={true}
        />
      );
      fireEvent.click(screen.getByTitle("리뷰 삭제"));
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/workspaces/ws-1/reviews/r1",
          { method: "DELETE" }
        );
      });
    });

    it("fetch 성공 → onReviewUpdated 콜백 호출", async () => {
      const onReviewUpdated = vi.fn();
      render(
        <WorkspaceReviewList
          reviews={[makeReview()]}
          isAdmin={true}
          onReviewUpdated={onReviewUpdated}
        />
      );
      fireEvent.click(screen.getByTitle("리뷰 삭제"));
      await waitFor(() => {
        expect(onReviewUpdated).toHaveBeenCalledTimes(1);
      });
    });

    it("fetch 실패(ok=false) → window.alert 호출", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "삭제 실패" }),
      });
      render(
        <WorkspaceReviewList reviews={[makeReview()]} isAdmin={true} />
      );
      fireEvent.click(screen.getByTitle("리뷰 삭제"));
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("삭제 실패");
      });
    });

    it("fetch 네트워크 오류 → window.alert 호출", async () => {
      (global.fetch as any).mockRejectedValue(new Error("Network error"));
      render(
        <WorkspaceReviewList reviews={[makeReview()]} isAdmin={true} />
      );
      fireEvent.click(screen.getByTitle("리뷰 삭제"));
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("리뷰 삭제에 실패했습니다.");
      });
    });
  });

  describe("이미지 썸네일 및 갤러리", () => {
    const reviewWithImages = makeReview({
      images: [
        { id: "img-1", image_url: "http://ex.com/1.jpg", caption: "캡션1", display_order: 0 },
        { id: "img-2", image_url: "http://ex.com/2.jpg", caption: null, display_order: 1 },
        { id: "img-3", image_url: "http://ex.com/3.jpg", caption: null, display_order: 2 },
      ],
    });

    it("이미지 썸네일 있으면 '사진 N개' 텍스트 표시", () => {
      render(<WorkspaceReviewList reviews={[reviewWithImages]} />);
      expect(screen.getByText("사진 3개")).toBeInTheDocument();
    });

    it("이미지 없으면 '사진 N개' 텍스트 미표시", () => {
      render(<WorkspaceReviewList reviews={[makeReview({ images: [] })]} />);
      expect(screen.queryByText(/사진 \d+개/)).not.toBeInTheDocument();
    });

    it("썸네일 클릭 → gallery-modal 열림", () => {
      render(<WorkspaceReviewList reviews={[reviewWithImages]} />);
      expect(screen.queryByTestId("gallery-modal")).not.toBeInTheDocument();
      const thumbnails = document.querySelectorAll("img[alt^='Review image']");
      fireEvent.click(thumbnails[0].parentElement!);
      expect(screen.getByTestId("gallery-modal")).toBeInTheDocument();
    });

    it("두 번째 썸네일 클릭 → gallery-modal이 index=1로 열림", () => {
      render(<WorkspaceReviewList reviews={[reviewWithImages]} />);
      const thumbnails = document.querySelectorAll("img[alt^='Review image']");
      fireEvent.click(thumbnails[1].parentElement!);
      expect(screen.getByTestId("gallery-modal")).toHaveAttribute(
        "data-index",
        "1"
      );
    });
  });

  describe("더 보기 / 접기", () => {
    it('"더 보기" 클릭 → "접기"로 변경', () => {
      render(<WorkspaceReviewList reviews={[makeReview()]} />);
      expect(screen.getByText("더 보기")).toBeInTheDocument();
      fireEvent.click(screen.getByText("더 보기"));
      expect(screen.getByText("접기")).toBeInTheDocument();
    });

    it('"접기" 클릭 → "더 보기"로 복원', () => {
      render(<WorkspaceReviewList reviews={[makeReview()]} />);
      fireEvent.click(screen.getByText("더 보기"));
      expect(screen.getByText("접기")).toBeInTheDocument();
      fireEvent.click(screen.getByText("접기"));
      expect(screen.getByText("더 보기")).toBeInTheDocument();
    });
  });
});
