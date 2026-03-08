-- ===================================================
-- 작업공간 리뷰 이미지 기능 추가
-- workspace_reviews 테이블에 has_images 필드 추가
-- workspace_review_images 새 테이블 생성
-- ===================================================

-- ===================================================
-- workspace_reviews 테이블 수정
-- ===================================================

ALTER TABLE workspace_reviews
ADD COLUMN has_images BOOLEAN DEFAULT FALSE NOT NULL;

-- has_images 인덱스 (이미지가 있는 리뷰를 빠르게 조회할 때)
CREATE INDEX idx_workspace_reviews_has_images ON workspace_reviews(has_images);

-- ===================================================
-- workspace_review_images 테이블 생성
-- 각 리뷰의 이미지 저장소
-- ===================================================

CREATE TABLE IF NOT EXISTS workspace_review_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES workspace_reviews(id) ON DELETE CASCADE,

  -- 이미지 정보
  image_url TEXT NOT NULL,                     -- Supabase Storage 공개 URL
  caption VARCHAR(500),                        -- 선택사항: 이미지 캡션
  display_order INTEGER NOT NULL DEFAULT 0,   -- 이미지 표시 순서
  file_size INTEGER,                           -- 파일 크기 (바이트)

  -- 타임스탐프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_workspace_review_images_review_id ON workspace_review_images(review_id);
CREATE INDEX idx_workspace_review_images_display_order ON workspace_review_images(review_id, display_order);

-- updated_at 트리거
CREATE TRIGGER update_workspace_review_images_updated_at
  BEFORE UPDATE ON workspace_review_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================
-- RLS (Row Level Security) 정책
-- ===================================================

ALTER TABLE workspace_review_images ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 이미지를 볼 수 있음
CREATE POLICY "workspace_review_images are viewable by everyone"
  ON workspace_review_images FOR SELECT
  USING (true);

-- 인증된 사용자만 이미지를 업로드할 수 있음
-- (리뷰 작성자만 업로드 가능하도록 함)
CREATE POLICY "authenticated users can insert workspace review images"
  ON workspace_review_images FOR INSERT
  TO authenticated
  WITH CHECK (
    -- 리뷰의 작성자여야만 이미지 추가 가능
    EXISTS (
      SELECT 1 FROM workspace_reviews
      WHERE id = review_id
      AND user_id = auth.uid()
    )
  );

-- 사용자는 자신의 리뷰 이미지만 삭제 가능
CREATE POLICY "users can delete own workspace review images"
  ON workspace_review_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_reviews
      WHERE id = review_id
      AND user_id = auth.uid()
    )
  );

-- 사용자는 자신의 리뷰 이미지만 수정 가능
CREATE POLICY "users can update own workspace review images"
  ON workspace_review_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_reviews
      WHERE id = review_id
      AND user_id = auth.uid()
    )
  );

-- ===================================================
-- 댓글: 마이그레이션 메타데이터
-- ===================================================

COMMENT ON TABLE workspace_review_images IS 'Stores images for workspace reviews. Max 5 images per review.';
COMMENT ON COLUMN workspace_review_images.image_url IS 'Public URL of the image stored in Supabase Storage';
COMMENT ON COLUMN workspace_review_images.caption IS 'Optional caption for the image (max 500 chars)';
COMMENT ON COLUMN workspace_review_images.display_order IS 'Order of images in the gallery (0-4)';
COMMENT ON COLUMN workspace_review_images.file_size IS 'Original file size in bytes';
