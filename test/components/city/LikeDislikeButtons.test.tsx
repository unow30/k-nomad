/**
 * @vitest environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock Server Action
vi.mock("@/app/actions/city-reactions", () => ({
  toggleCityReaction: vi.fn(),
}));

// Mock UI 컴포넌트들
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  ThumbsUp: ({ className }: any) => <span data-testid="thumbs-up" className={className} />,
  ThumbsDown: ({ className }: any) => <span data-testid="thumbs-down" className={className} />,
  Loader2: () => <span data-testid="loader" />,
}));

import LikeDislikeButtons from "@/components/city/LikeDislikeButtons";
import { toggleCityReaction } from "@/app/actions/city-reactions";

describe("LikeDislikeButtons", () => {
  const getLikeButton = () => screen.getByTestId("thumbs-up").parentElement!;
  const getDislikeButton = () => screen.getByTestId("thumbs-down").parentElement!;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("로컬 모드 (cityId 없음)", () => {
    it("초기 렌더링 - likes와 dislikes 표시", () => {
      render(
        <LikeDislikeButtons
          initialLikes={10}
          initialDislikes={5}
        />
      );

      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("좋아요 클릭 시 카운트 증가", async () => {
      const user = userEvent.setup();
      render(
        <LikeDislikeButtons
          initialLikes={10}
          initialDislikes={5}
        />
      );

      // 좋아요 버튼 클릭
      await user.click(getLikeButton());

      // 카운트가 11로 증가했는지 확인
      await waitFor(() => {
        expect(screen.getByText("11")).toBeInTheDocument();
      });
    });

    it("싫어요 클릭 시 카운트 증가", async () => {
      const user = userEvent.setup();
      render(
        <LikeDislikeButtons
          initialLikes={10}
          initialDislikes={5}
        />
      );

      // 싫어요 버튼 클릭
      await user.click(getDislikeButton());

      // 카운트가 6으로 증가했는지 확인
      await waitFor(() => {
        expect(screen.getByText("6")).toBeInTheDocument();
      });
    });

    it("좋아요 → 취소 시 카운트 감소", async () => {
      const user = userEvent.setup();
      render(
        <LikeDislikeButtons
          initialLikes={10}
          initialDislikes={5}
          initialUserLike={true}
        />
      );

      // 좋아요 버튼 다시 클릭 (취소)
      await user.click(getLikeButton());

      // 카운트가 9로 감소했는지 확인
      await waitFor(() => {
        expect(screen.getByText("9")).toBeInTheDocument();
      });
    });

    it("좋아요 → 싫어요로 전환 시 양쪽 모두 조정", async () => {
      const user = userEvent.setup();
      render(
        <LikeDislikeButtons
          initialLikes={10}
          initialDislikes={5}
          initialUserLike={true}
        />
      );

      // 싫어요 버튼 클릭 (좋아요 상태에서)
      await user.click(getDislikeButton());

      // likes 9, dislikes 6 확인
      await waitFor(() => {
        expect(screen.getByText("9")).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
      });
    });
  });

  describe("서버 모드 (cityId 있음)", () => {
    it("좋아요 클릭 시 Server Action 호출", async () => {
      const user = userEvent.setup();
      (toggleCityReaction as any).mockResolvedValue({
        success: true,
      });

      render(
        <LikeDislikeButtons
          initialLikes={10}
          initialDislikes={5}
          cityId="city-1"
          cityName="서울"
        />
      );

      // 좋아요 버튼 클릭
      await user.click(getLikeButton());

      // Server Action이 호출되었는지 확인
      await waitFor(() => {
        expect(toggleCityReaction).toHaveBeenCalledWith("city-1", "like");
      });
    });

    it("싫어요 클릭 시 Server Action 호출", async () => {
      const user = userEvent.setup();
      (toggleCityReaction as any).mockResolvedValue({
        success: true,
      });

      render(
        <LikeDislikeButtons
          initialLikes={10}
          initialDislikes={5}
          cityId="city-1"
          cityName="서울"
        />
      );

      // 싫어요 버튼 클릭
      await user.click(getDislikeButton());

      // Server Action이 호출되었는지 확인
      await waitFor(() => {
        expect(toggleCityReaction).toHaveBeenCalledWith("city-1", "dislike");
      });
    });

    it("Server Action 성공 시 낙관적 업데이트 유지", async () => {
      const user = userEvent.setup();
      (toggleCityReaction as any).mockResolvedValue({
        success: true,
      });

      render(
        <LikeDislikeButtons
          initialLikes={10}
          initialDislikes={5}
          cityId="city-1"
          cityName="서울"
        />
      );

      // 좋아요 클릭
      await user.click(getLikeButton());

      // 낙관적 업데이트로 11이 표시됨
      await waitFor(() => {
        expect(screen.getByText("11")).toBeInTheDocument();
      });
    });

    it("Server Action 실패 시 rollback 및 alert", async () => {
      const user = userEvent.setup();
      const alertMock = vi.fn();
      global.alert = alertMock;

      (toggleCityReaction as any).mockResolvedValue({
        success: false,
        error: "반응 업데이트에 실패했습니다",
      });

      render(
        <LikeDislikeButtons
          initialLikes={10}
          initialDislikes={5}
          cityId="city-1"
          cityName="서울"
        />
      );

      // 좋아요 클릭
      await user.click(getLikeButton());

      // Alert이 호출되었는지 확인
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith("반응 업데이트에 실패했습니다");
      });

      // 카운트가 원래대로 롤백됨 (여전히 10)
      await waitFor(() => {
        expect(screen.getByText("10")).toBeInTheDocument();
      });
    });

    it("미인증 에러 시 로그인 다이얼로그 표시", async () => {
      const user = userEvent.setup();

      (toggleCityReaction as any).mockResolvedValue({
        success: false,
        error: "로그인이 필요합니다",
      });

      render(
        <LikeDislikeButtons
          initialLikes={10}
          initialDislikes={5}
          cityId="city-1"
          cityName="서울"
        />
      );

      // 좋아요 클릭
      await user.click(getLikeButton());

      // 로그인 다이얼로그 메시지 확인
      await waitFor(() => {
        expect(screen.getByText("서울 도시에 평가를 남기려면 로그인해주세요.")).toBeInTheDocument();
      });
    });
  });

  describe("초기 상태", () => {
    it("좋아요 상태로 초기화", () => {
      render(
        <LikeDislikeButtons
          initialLikes={10}
          initialDislikes={5}
          initialUserLike={true}
          initialUserDislike={false}
        />
      );

      // 좋아요 아이콘이 활성 상태인지 확인 (색상이 blue-500)
      const likeIcon = screen.getByTestId("thumbs-up");
      expect(likeIcon).toHaveClass("text-blue-500");
    });

    it("싫어요 상태로 초기화", () => {
      render(
        <LikeDislikeButtons
          initialLikes={10}
          initialDislikes={5}
          initialUserLike={false}
          initialUserDislike={true}
        />
      );

      // 싫어요 아이콘이 활성 상태인지 확인 (색상이 red-500)
      const dislikeIcon = screen.getByTestId("thumbs-down");
      expect(dislikeIcon).toHaveClass("text-red-500");
    });
  });
});
