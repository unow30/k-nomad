-- ===========================================
-- 작업 공간 관련 테이블 생성
-- workspaces, workspace_ratings, workspace_reviews
-- ===========================================

-- ===========================================
-- Enum 타입 정의
-- ===========================================

-- 작업 공간 타입
CREATE TYPE workspace_type AS ENUM ('cafe', 'coworking', 'library', 'hotel_lobby', 'other');

-- 가격 범위
CREATE TYPE price_range_type AS ENUM ('free', 'low', 'medium', 'high');

-- ===========================================
-- workspaces 테이블
-- 작업 공간 기본 정보
-- ===========================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  -- 기본 정보
  name VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  type workspace_type NOT NULL DEFAULT 'cafe',
  address TEXT NOT NULL,
  description TEXT,

  -- 작업 환경
  wifi_speed INTEGER,                    -- WiFi 속도 (Mbps)
  has_power BOOLEAN DEFAULT true,        -- 콘센트 유무
  price_range price_range_type DEFAULT 'low',
  opening_hours VARCHAR(200),            -- 영업시간 (예: "평일 09:00-22:00")

  -- 연락처 정보
  phone VARCHAR(50),
  website TEXT,

  -- 위치 정보 (추후 지도 연동용)
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),

  -- 이미지
  image_url TEXT,

  -- 통계 (집계 데이터)
  average_rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,

  -- 데이터 관리
  data_source VARCHAR(50) DEFAULT 'seed',  -- 데이터 출처 (seed, user_input, api)

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_workspaces_city_id ON workspaces(city_id);
CREATE INDEX idx_workspaces_type ON workspaces(type);
CREATE INDEX idx_workspaces_average_rating ON workspaces(average_rating DESC);
CREATE INDEX idx_workspaces_city_type ON workspaces(city_id, type);

-- RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있음
CREATE POLICY "workspaces are viewable by everyone"
  ON workspaces FOR SELECT
  USING (true);

-- 인증된 관리자만 생성/수정/삭제 가능 (향후 관리자 역할 추가 시)
-- 현재는 마이그레이션/시드 데이터로만 추가

-- updated_at 트리거
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- workspace_ratings 테이블
-- 사용자의 작업 공간 평가
-- ===========================================
CREATE TABLE IF NOT EXISTS workspace_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 평가 정보
  overall_score DECIMAL(2,1) CHECK (overall_score >= 1 AND overall_score <= 5) NOT NULL,
  wifi_speed_rating INTEGER CHECK (wifi_speed_rating >= 1 AND wifi_speed_rating <= 5),
  seat_comfort_rating INTEGER CHECK (seat_comfort_rating >= 1 AND seat_comfort_rating <= 5),
  noise_level_rating INTEGER CHECK (noise_level_rating >= 1 AND noise_level_rating <= 5),
  power_outlet_rating INTEGER CHECK (power_outlet_rating >= 1 AND power_outlet_rating <= 5),

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 각 사용자는 작업 공간당 하나의 평가만 가능
  UNIQUE(workspace_id, user_id)
);

-- 인덱스
CREATE INDEX idx_workspace_ratings_workspace_id ON workspace_ratings(workspace_id);
CREATE INDEX idx_workspace_ratings_user_id ON workspace_ratings(user_id);
CREATE INDEX idx_workspace_ratings_workspace_user ON workspace_ratings(workspace_id, user_id);

-- RLS
ALTER TABLE workspace_ratings ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있음
CREATE POLICY "workspace_ratings are viewable by everyone"
  ON workspace_ratings FOR SELECT
  USING (true);

-- 인증된 사용자만 삽입 가능
CREATE POLICY "authenticated users can insert own workspace ratings"
  ON workspace_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 평가만 수정 가능
CREATE POLICY "users can update own workspace ratings"
  ON workspace_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 사용자는 자신의 평가만 삭제 가능
CREATE POLICY "users can delete own workspace ratings"
  ON workspace_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at 트리거
CREATE TRIGGER update_workspace_ratings_updated_at
  BEFORE UPDATE ON workspace_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- workspace_reviews 테이블
-- 사용자의 작업 공간 상세 리뷰
-- ===========================================
CREATE TABLE IF NOT EXISTS workspace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 리뷰 정보
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  visited_at DATE,                       -- 방문 날짜
  is_recommended BOOLEAN DEFAULT true,   -- 추천 여부

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_workspace_reviews_workspace_id ON workspace_reviews(workspace_id);
CREATE INDEX idx_workspace_reviews_user_id ON workspace_reviews(user_id);
CREATE INDEX idx_workspace_reviews_created_at ON workspace_reviews(created_at DESC);
CREATE INDEX idx_workspace_reviews_rating ON workspace_reviews(rating DESC);

-- RLS
ALTER TABLE workspace_reviews ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있음
CREATE POLICY "workspace_reviews are viewable by everyone"
  ON workspace_reviews FOR SELECT
  USING (true);

-- 인증된 사용자만 삽입 가능
CREATE POLICY "authenticated users can insert workspace reviews"
  ON workspace_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 리뷰만 수정 가능
CREATE POLICY "users can update own workspace reviews"
  ON workspace_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 사용자는 자신의 리뷰만 삭제 가능
CREATE POLICY "users can delete own workspace reviews"
  ON workspace_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at 트리거
CREATE TRIGGER update_workspace_reviews_updated_at
  BEFORE UPDATE ON workspace_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 평균 평점 자동 업데이트 트리거
-- ===========================================

-- 작업 공간 평균 평점 업데이트 함수
CREATE OR REPLACE FUNCTION update_workspace_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- workspace_ratings 테이블 변경 시
  IF TG_TABLE_NAME = 'workspace_ratings' THEN
    UPDATE workspaces
    SET
      average_rating = (
        SELECT COALESCE(AVG(overall_score), 0.0)
        FROM workspace_ratings
        WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id)
      )
    WHERE id = COALESCE(NEW.workspace_id, OLD.workspace_id);
  END IF;

  -- workspace_reviews 테이블 변경 시
  IF TG_TABLE_NAME = 'workspace_reviews' THEN
    UPDATE workspaces
    SET
      review_count = (
        SELECT COUNT(*)
        FROM workspace_reviews
        WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id)
      )
    WHERE id = COALESCE(NEW.workspace_id, OLD.workspace_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- workspace_ratings INSERT/UPDATE/DELETE 트리거
CREATE TRIGGER update_workspace_rating_on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON workspace_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_workspace_rating_stats();

-- workspace_reviews INSERT/UPDATE/DELETE 트리거
CREATE TRIGGER update_workspace_review_count_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON workspace_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_workspace_rating_stats();
