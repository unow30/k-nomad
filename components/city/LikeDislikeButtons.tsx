"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toggleCityReaction } from "@/app/actions/city-reactions";

interface LikeDislikeButtonsProps {
  initialLikes: number;
  initialDislikes: number;
  cityId?: string;
  cityName?: string;
  initialUserLike?: boolean;
  initialUserDislike?: boolean;
}

type UserChoice = "none" | "like" | "dislike";

/**
 * 좋아요/싫어요 버튼 컴포넌트
 * Server Action과 연동하여 데이터를 저장합니다.
 */
export default function LikeDislikeButtons({
  initialLikes,
  initialDislikes,
  cityId,
  cityName,
  initialUserLike = false,
  initialUserDislike = false,
}: LikeDislikeButtonsProps) {
  // 초기 사용자 선택 상태 설정
  const getInitialChoice = (): UserChoice => {
    if (initialUserLike) return "like";
    if (initialUserDislike) return "dislike";
    return "none";
  };

  const [userChoice, setUserChoice] = useState<UserChoice>(getInitialChoice());
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [isPending, startTransition] = useTransition();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 도시 ID가 없으면 (카드 컴포넌트) 로컬 상태만 변경
    if (!cityId) {
      if (userChoice === "none") {
        setUserChoice("like");
        setLikes(likes + 1);
      } else if (userChoice === "like") {
        setUserChoice("none");
        setLikes(likes - 1);
      } else {
        setUserChoice("like");
        setLikes(likes + 1);
        setDislikes(dislikes - 1);
      }
      return;
    }

    // cityId가 있으면 Server Action 호출
    // 낙관적 UI 업데이트
    const prevChoice = userChoice;
    const prevLikes = likes;
    const prevDislikes = dislikes;

    if (userChoice === "none") {
      setUserChoice("like");
      setLikes(likes + 1);
    } else if (userChoice === "like") {
      setUserChoice("none");
      setLikes(likes - 1);
    } else {
      setUserChoice("like");
      setLikes(likes + 1);
      setDislikes(dislikes - 1);
    }

    startTransition(async () => {
      const result = await toggleCityReaction(cityId, "like");

      if (!result.success) {
        // 에러 발생 시 이전 상태로 롤백
        setUserChoice(prevChoice);
        setLikes(prevLikes);
        setDislikes(prevDislikes);

        if (result.error === "로그인이 필요합니다") {
          setShowLoginDialog(true);
        } else {
          alert(result.error || "평가 제출에 실패했습니다.");
        }
      }
    });
  };

  const handleDislikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 도시 ID가 없으면 (카드 컴포넌트) 로컬 상태만 변경
    if (!cityId) {
      if (userChoice === "none") {
        setUserChoice("dislike");
        setDislikes(dislikes + 1);
      } else if (userChoice === "dislike") {
        setUserChoice("none");
        setDislikes(dislikes - 1);
      } else {
        setUserChoice("dislike");
        setDislikes(dislikes + 1);
        setLikes(likes - 1);
      }
      return;
    }

    // cityId가 있으면 Server Action 호출
    // 낙관적 UI 업데이트
    const prevChoice = userChoice;
    const prevLikes = likes;
    const prevDislikes = dislikes;

    if (userChoice === "none") {
      setUserChoice("dislike");
      setDislikes(dislikes + 1);
    } else if (userChoice === "dislike") {
      setUserChoice("none");
      setDislikes(dislikes - 1);
    } else {
      setUserChoice("dislike");
      setDislikes(dislikes + 1);
      setLikes(likes - 1);
    }

    startTransition(async () => {
      const result = await toggleCityReaction(cityId, "dislike");

      if (!result.success) {
        // 에러 발생 시 이전 상태로 롤백
        setUserChoice(prevChoice);
        setLikes(prevLikes);
        setDislikes(prevDislikes);

        if (result.error === "로그인이 필요합니다") {
          setShowLoginDialog(true);
        } else {
          alert(result.error || "평가 제출에 실패했습니다.");
        }
      }
    });
  };

  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-4 pt-3 border-t"
      >
        <div
          onClick={handleLikeClick}
          className={`bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 cursor-pointer flex items-center gap-1 transition-all ${
            isPending ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin pointer-events-none" />
          ) : (
            <ThumbsUp
              className={`h-4 w-4 pointer-events-none ${
                userChoice === "like" ? "text-blue-500 fill-blue-500" : "text-muted-foreground"
              }`}
            />
          )}
          <span
            className={`text-sm pointer-events-none ${
              userChoice === "like" ? "text-blue-500" : "text-muted-foreground"
            }`}
          >
            {likes}
          </span>
        </div>

        <div
          onClick={handleDislikeClick}
          className={`bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 cursor-pointer flex items-center gap-1 transition-all ${
            isPending ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin pointer-events-none" />
          ) : (
            <ThumbsDown
              className={`h-4 w-4 pointer-events-none ${
                userChoice === "dislike" ? "text-red-500 fill-red-500" : "text-muted-foreground"
              }`}
            />
          )}
          <span
            className={`text-sm pointer-events-none ${
              userChoice === "dislike" ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            {dislikes}
          </span>
        </div>
      </div>

      {/* 로그인 필요 다이얼로그 */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>로그인이 필요합니다</DialogTitle>
            <DialogDescription>
              {cityName} 도시에 평가를 남기려면 로그인해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLoginDialog(false)}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={() => (window.location.href = "/login")}
            >
              로그인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
