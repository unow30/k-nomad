"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingText?: string;
}

/**
 * 폼 제출 버튼 컴포넌트
 * Server Action 실행 중 로딩 상태 표시
 */
export function SubmitButton({ children, pendingText }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText || "처리 중..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
