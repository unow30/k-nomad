-- ===========================================
-- Phase 1: 데이터베이스 스키마 설계
-- city_metrics, user_ratings, user_reviews, users 테이블 생성
-- ===========================================

-- ===========================================
-- city_metrics 테이블
-- 실시간으로 변하는 메트릭 데이터
-- ===========================================
CREATE TABLE IF NOT EXISTS city_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  -- 실시간 메트릭
  current_temp DECIMAL(4,1),          -- 현재 기온 (°C)
  aqi INTEGER,                        -- 미세먼지 AQI (0-500)
  aqi_label VARCHAR(50),              -- 미세먼지 라벨 (좋음, 보통, 나쁨, 매우나쁨)
  internet_speed DECIMAL(6,1),        -- 인터넷 속도 (Mbps)
  monthly_budget INTEGER,             -- 월 생활비 (만원)
  rent_studio INTEGER,                -- 원룸 월세 (만원)

  -- 데이터 관리
  data_source VARCHAR(50) DEFAULT 'api',  -- 데이터 출처 (api, user_input)

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 각 도시마다 최신 메트릭만 필요하도록 Unique 제약
  UNIQUE(city_id)
);

-- 인덱스
CREATE INDEX idx_city_metrics_city_id ON city_metrics(city_id);
CREATE INDEX idx_city_metrics_updated_at ON city_metrics(updated_at DESC);

-- RLS
ALTER TABLE city_metrics ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있음
CREATE POLICY "city_metrics are viewable by everyone"
  ON city_metrics FOR SELECT
  USING (true);

-- updated_at 트리거
CREATE TRIGGER update_city_metrics_updated_at
  BEFORE UPDATE ON city_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- user_ratings 테이블
-- 사용자의 평가를 저장
-- ===========================================
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 평가 정보
  overall_score DECIMAL(2,1) CHECK (overall_score >= 1 AND overall_score <= 5),
  likes INTEGER CHECK (likes IN (-1, 0, 1)) DEFAULT 0,  -- -1: 싫어요, 0: 중립, 1: 좋아요

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 각 사용자는 도시당 하나의 평가만 가능
  UNIQUE(city_id, user_id)
);

-- 인덱스
CREATE INDEX idx_user_ratings_city_id ON user_ratings(city_id);
CREATE INDEX idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX idx_user_ratings_city_user ON user_ratings(city_id, user_id);

-- RLS
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있음
CREATE POLICY "user_ratings are viewable by everyone"
  ON user_ratings FOR SELECT
  USING (true);

-- 인증된 사용자만 삽입 가능
CREATE POLICY "authenticated users can insert own ratings"
  ON user_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 평가만 수정 가능
CREATE POLICY "users can update own ratings"
  ON user_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 사용자는 자신의 평가만 삭제 가능
CREATE POLICY "users can delete own ratings"
  ON user_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at 트리거
CREATE TRIGGER update_user_ratings_updated_at
  BEFORE UPDATE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- user_reviews 테이블
-- 사용자의 상세 리뷰 텍스트
-- ===========================================
CREATE TABLE IF NOT EXISTS user_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 리뷰 정보
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_user_reviews_city_id ON user_reviews(city_id);
CREATE INDEX idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX idx_user_reviews_created_at ON user_reviews(created_at DESC);

-- RLS
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있음
CREATE POLICY "user_reviews are viewable by everyone"
  ON user_reviews FOR SELECT
  USING (true);

-- 인증된 사용자만 삽입 가능
CREATE POLICY "authenticated users can insert reviews"
  ON user_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 리뷰만 수정 가능
CREATE POLICY "users can update own reviews"
  ON user_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 사용자는 자신의 리뷰만 삭제 가능
CREATE POLICY "users can delete own reviews"
  ON user_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at 트리거
CREATE TRIGGER update_user_reviews_updated_at
  BEFORE UPDATE ON user_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- users 테이블 (Supabase Auth 확장)
-- 기존 profiles 테이블을 사용하거나 별도로 확장
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  username VARCHAR(100) UNIQUE,
  profile_image TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 공개 정보 읽기 가능 (username, profile_image만 노출)
CREATE POLICY "users public info viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- 사용자는 자신의 정보만 수정 가능
CREATE POLICY "users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- updated_at 트리거
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 새 사용자 가입 시 users 테이블에 자동 생성
-- ===========================================
CREATE OR REPLACE FUNCTION handle_new_user_v2()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_v2
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_v2();
