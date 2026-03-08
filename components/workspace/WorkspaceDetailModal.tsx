"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Workspace, WorkspaceReview } from "@/types/workspace";
import WorkspaceDetailHero from "./WorkspaceDetailHero";
import WorkspaceReviewSection from "./WorkspaceReviewSection";
import { Loader2 } from "lucide-react";

interface WorkspaceDetailModalProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 작업공간 상세 정보를 모달로 표시하는 컴포넌트
 */
export default function WorkspaceDetailModal({
  workspaceId,
  open,
  onOpenChange,
}: WorkspaceDetailModalProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [reviews, setReviews] = useState<WorkspaceReview[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && workspaceId) {
      fetchWorkspaceData();
    }
  }, [open, workspaceId]);

  const fetchWorkspaceData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`);

      if (!response.ok) {
        throw new Error("작업공간 정보를 불러올 수 없습니다");
      }

      const data = await response.json();
      setWorkspace(data.workspace);
      setReviews(data.reviews || []);
      setCurrentUserId(data.user_id || null);
      setIsAdmin(data.is_admin || false);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      setError(error instanceof Error ? error.message : "오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewUpdate = () => {
    // 리뷰가 추가/수정되면 데이터 다시 로드
    fetchWorkspaceData();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* 접근성을 위한 숨겨진 제목 */}
        <DialogHeader className="sr-only">
          <DialogTitle>
            {workspace ? workspace.name : "작업공간 상세 정보"}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {workspace && !isLoading && !error && (
          <div>
            <WorkspaceDetailHero workspace={workspace} />
            <WorkspaceReviewSection
              reviews={reviews}
              workspaceId={workspace.id}
              workspaceName={workspace.name}
              currentUserId={currentUserId ?? undefined}
              isAdmin={isAdmin}
              onReviewUpdate={handleReviewUpdate}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
