-- Enum: 제안 상태
CREATE TYPE suggestion_status AS ENUM ('pending', 'approved', 'rejected');

-- 테이블: workspace_suggestions
CREATE TABLE workspace_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- workspaces와 동일한 필드 구조
  name VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  type workspace_type NOT NULL DEFAULT 'cafe',
  address TEXT NOT NULL,
  description TEXT,
  wifi_speed INTEGER,
  has_power BOOLEAN DEFAULT true,
  price_range price_range_type DEFAULT 'low',
  opening_hours VARCHAR(200),
  phone VARCHAR(50),
  website TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),

  -- Storage 경로 (예: suggestions/{suggestion_id}/image.jpg)
  image_path TEXT,

  -- 제안 관리
  status suggestion_status NOT NULL DEFAULT 'pending',
  admin_note TEXT,  -- 거절 사유
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  approved_workspace_id UUID REFERENCES workspaces(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_workspace_suggestions_city_id ON workspace_suggestions(city_id);
CREATE INDEX idx_workspace_suggestions_user_id ON workspace_suggestions(user_id);
CREATE INDEX idx_workspace_suggestions_status ON workspace_suggestions(status);
CREATE INDEX idx_workspace_suggestions_created_at ON workspace_suggestions(created_at DESC);

-- RLS 활성화
ALTER TABLE workspace_suggestions ENABLE ROW LEVEL SECURITY;

-- 정책 1: 사용자는 자신의 제안만 조회
CREATE POLICY "Users can view own suggestions"
  ON workspace_suggestions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 정책 2: Admin은 모든 제안 조회
CREATE POLICY "Admins can view all suggestions"
  ON workspace_suggestions FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 정책 3: 인증된 사용자는 제안 작성 가능
CREATE POLICY "Authenticated users can insert suggestions"
  ON workspace_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 정책 4: 사용자는 pending 상태의 자신 제안만 수정
CREATE POLICY "Users can update own pending suggestions"
  ON workspace_suggestions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

-- 정책 5: Admin은 모든 제안 수정 가능
CREATE POLICY "Admins can update all suggestions"
  ON workspace_suggestions FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- 정책 6: 사용자는 pending 상태의 자신 제안만 삭제
CREATE POLICY "Users can delete own pending suggestions"
  ON workspace_suggestions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

-- 정책 7: Admin은 모든 제안 삭제 가능
CREATE POLICY "Admins can delete all suggestions"
  ON workspace_suggestions FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER update_workspace_suggestions_updated_at
  BEFORE UPDATE ON workspace_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspaces', 'workspaces', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: 인증된 사용자 업로드
CREATE POLICY "Users can upload suggestion images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'workspaces');

-- Storage RLS: 모든 사용자 읽기
CREATE POLICY "Anyone can view workspace images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'workspaces');

-- Storage RLS: Admin은 모든 이미지 관리
CREATE POLICY "Admins can manage all images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'workspaces' AND public.is_admin());
