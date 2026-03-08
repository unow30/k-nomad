-- ===================================================
-- workspace_review_images 테이블에 original_filename 컬럼 추가
-- 스토리지 경로: {review_id}/yyyymmdd-HHmmss.{ext}
-- 원본 파일명은 original_filename 컬럼에 기록
-- ===================================================

ALTER TABLE workspace_review_images
ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255);

COMMENT ON COLUMN workspace_review_images.original_filename IS 'Original filename as uploaded by the user, before renaming for storage';
