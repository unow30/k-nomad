'use client';

import { toggleWorkspaceVisibility } from '@/app/actions/workspaces';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ToggleWorkspaceVisibilityButton({
  workspaceId,
  workspaceName,
  isHidden,
}: {
  workspaceId: string;
  workspaceName: string;
  isHidden: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [localIsHidden, setLocalIsHidden] = useState(isHidden);
  const router = useRouter();

  const handleToggle = async () => {
    const action = localIsHidden ? '표시' : '숨김';
    const newHiddenState = !localIsHidden;

    setIsLoading(true);
    setLocalIsHidden(newHiddenState); // 낙관적 업데이트

    const result = await toggleWorkspaceVisibility(workspaceId, newHiddenState);

    if (result.success) {
      setIsLoading(false);
      router.refresh();
    } else {
      alert(`${action} 처리 실패: ${result.error}`);
      setLocalIsHidden(!newHiddenState); // 실패 시 원래대로 복구
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${
        localIsHidden
          ? 'text-green-600 hover:text-green-900'
          : 'text-orange-600 hover:text-orange-900'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? '처리 중...' : localIsHidden ? '숨김 완료' : '숨김 처리'}
    </button>
  );
}
