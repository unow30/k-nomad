-- ===================================================
-- workspace-review-images 스토리지 버킷 생성 및 정책 설정
-- ===================================================

-- 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workspace-review-images',
  'workspace-review-images',
  TRUE,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 스토리지 RLS 정책: 공개 읽기 (누구나 이미지 조회 가능)
DROP POLICY IF EXISTS "workspace_review_images_public_read" ON storage.objects;
CREATE POLICY "workspace_review_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'workspace-review-images');

-- 스토리지 RLS 정책: 인증된 사용자 업로드
DROP POLICY IF EXISTS "workspace_review_images_authenticated_insert" ON storage.objects;
CREATE POLICY "workspace_review_images_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'workspace-review-images');

-- 스토리지 RLS 정책: 본인 파일 삭제
DROP POLICY IF EXISTS "workspace_review_images_owner_delete" ON storage.objects;
CREATE POLICY "workspace_review_images_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'workspace-review-images' AND owner = auth.uid());
