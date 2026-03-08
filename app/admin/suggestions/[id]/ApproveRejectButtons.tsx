'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function ApproveRejectButtons({ suggestionId }: { suggestionId: string }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!confirm('이 제안을 승인하고 작업공간을 생성하시겠습니까?')) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/suggestions/${suggestionId}/approve`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const { error } = await response.json();
        setError(error || '승인 실패');
        return;
      }

      alert('제안이 승인되었습니다!');
      router.push('/admin/suggestions');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '승인 처리 중 오류가 발생했습니다');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!adminNote.trim()) {
      setError('거절 사유를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/suggestions/${suggestionId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_note: adminNote }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setError(error || '거절 실패');
        return;
      }

      alert('제안이 거절되었습니다.');
      router.push('/admin/suggestions');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '거절 처리 중 오류가 발생했습니다');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 text-sm mb-4">
          {error}
        </div>
      )}

      {!showRejectModal ? (
        <div className="flex gap-3">
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            ✅ 승인
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className="flex-1"
          >
            ❌ 거절
          </Button>
        </div>
      ) : (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">거절 사유를 입력하세요</h3>
          <Textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="거절 사유를 상세히 입력해주세요"
            rows={4}
          />
          <div className="flex gap-3">
            <Button
              onClick={handleReject}
              disabled={isProcessing || !adminNote.trim()}
              variant="destructive"
              className="flex-1"
            >
              {isProcessing ? '처리 중...' : '거절 확인'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setAdminNote('');
                setError(null);
              }}
              disabled={isProcessing}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
