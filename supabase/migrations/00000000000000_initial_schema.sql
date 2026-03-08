-- ===========================================
-- 초기 스키마 마이그레이션
-- 대한민국 노마드 도시 프로젝트
-- ===========================================

-- 지역 ENUM 타입
CREATE TYPE region_type AS ENUM (
  'jeju',
  'gyeongsang',
  'gangwon',
  'jeolla',
  'chungcheong',
  'seoul',
  'gyeonggi'
);

-- 미세먼지 등급 ENUM 타입
CREATE TYPE aqi_label_type AS ENUM (
  '좋음',
  '보통',
  '나쁨',
  '매우나쁨'
);

-- ===========================================
-- 도시 테이블
-- ===========================================
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 기본 정보
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  region region_type NOT NULL,
  province VARCHAR(100) NOT NULL,

  -- 순위 및 점수
  rank INTEGER,
  overall_score DECIMAL(2,1) CHECK (overall_score >= 0 AND overall_score <= 5),
  review_count INTEGER DEFAULT 0,

  -- 비용 정보 (만원 단위)
  monthly_budget INTEGER, -- 월 생활비
  rent_studio INTEGER,    -- 원룸 월세

  -- 인프라 정보
  internet_speed INTEGER, -- Mbps
  cafe_count INTEGER,     -- 카페/작업공간 수
  ktx_time DECIMAL(3,1),  -- 서울까지 KTX 소요시간 (시간)

  -- 환경 정보
  current_temp INTEGER,   -- 현재 기온
  aqi INTEGER,            -- 미세먼지 지수
  aqi_label aqi_label_type,

  -- 사용자 반응
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,

  -- 이미지
  image_url TEXT,

  -- 위치 정보
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- 태그 (배열)
  tags TEXT[] DEFAULT '{}',

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 인덱스
-- ===========================================
CREATE INDEX idx_cities_region ON cities(region);
CREATE INDEX idx_cities_rank ON cities(rank);
CREATE INDEX idx_cities_overall_score ON cities(overall_score DESC);
CREATE INDEX idx_cities_monthly_budget ON cities(monthly_budget);

-- ===========================================
-- RLS (Row Level Security) 정책
-- ===========================================
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 도시 정보를 읽을 수 있음
CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  USING (true);

-- 인증된 사용자만 도시 정보를 수정할 수 있음 (관리자용)
CREATE POLICY "Only authenticated users can insert cities"
  ON cities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update cities"
  ON cities FOR UPDATE
  TO authenticated
  USING (true);

-- ===========================================
-- 트리거: updated_at 자동 갱신
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 사용자 프로필 테이블 (Supabase Auth 연동)
-- ===========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프로필 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 프로필을 읽을 수 있음
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 프로필 updated_at 트리거
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 사용자 가입 시 프로필 자동 생성 트리거
-- ===========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
