'use client';

import {
  hideWorkspaceReview,
  unhideWorkspaceReview,
  deleteAdminWorkspaceReview,
} from '@/app/actions/reviews';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function WorkspaceReviewActions({
  reviewId,
  isHidden,
  reviewTitle,
}: {
  reviewId: string;
  isHidden: boolean;
  reviewTitle: string;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [localIsHidden, setLocalIsHidden] = useState(isHidden);
  const router = useRouter();

  const handleHideToggle = async () => {
    const action = localIsHidden ? '숨김 해제' : '숨김 처리';
    const newHiddenState = !localIsHidden;

    setIsProcessing(true);
    setLocalIsHidden(newHiddenState);

    const result = newHiddenState
      ? await hideWorkspaceReview(reviewId)
      : await unhideWorkspaceReview(reviewId);

    if (result.success) {
      setIsProcessing(false);
      router.refresh();
    } else {
      alert(`${action} 실패: ${result.error}`);
      setLocalIsHidden(!newHiddenState);
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `"${reviewTitle}" 리뷰를 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    setIsProcessing(true);

    const result = await deleteAdminWorkspaceReview(reviewId);

    if (result.success) {
      router.refresh();
    } else {
      alert(`삭제 실패: ${result.error}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2 ml-4">
      <button
        onClick={handleHideToggle}
        disabled={isProcessing}
        className={`px-3 py-1 text-sm rounded ${
          localIsHidden
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-yellow-600 text-white hover:bg-yellow-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? '처리 중...' : localIsHidden ? '숨김 완료' : '숨김 처리'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isProcessing}
        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? '삭제 중...' : '🗑️ 삭제'}
      </button>
    </div>
  );
}
