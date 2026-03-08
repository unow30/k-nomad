-- workspace_review_images 소프트 삭제를 위한 is_hidden 컬럼 추가
ALTER TABLE workspace_review_images
  ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_workspace_review_images_is_hidden
  ON workspace_review_images(review_id, is_hidden);
