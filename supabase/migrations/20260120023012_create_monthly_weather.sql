-- ===========================================
-- monthly_weather 테이블
-- 도시별 월별 날씨 정보 저장
-- ===========================================
CREATE TABLE IF NOT EXISTS monthly_weather (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,

  -- 월 정보 (1-12)
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),

  -- 기온 정보 (°C)
  avg_temp DECIMAL(4,1) NOT NULL,  -- 평균 기온
  max_temp DECIMAL(4,1) NOT NULL,  -- 최고 기온
  min_temp DECIMAL(4,1) NOT NULL,  -- 최저 기온

  -- 강수량 (mm)
  rainfall DECIMAL(5,1) NOT NULL DEFAULT 0,

  -- 데이터 관리
  data_source VARCHAR(50) DEFAULT 'seed',  -- 데이터 출처 (seed, api, manual)

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 각 도시의 특정 월은 하나의 레코드만 존재
  UNIQUE(city_id, month)
);

-- ===========================================
-- 인덱스
-- ===========================================
CREATE INDEX idx_monthly_weather_city_id ON monthly_weather(city_id);
CREATE INDEX idx_monthly_weather_city_month ON monthly_weather(city_id, month);

-- ===========================================
-- RLS (Row Level Security) 정책
-- ===========================================
ALTER TABLE monthly_weather ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 월별 날씨 정보를 읽을 수 있음
CREATE POLICY "monthly_weather is viewable by everyone"
  ON monthly_weather FOR SELECT
  USING (true);

-- 인증된 사용자만 월별 날씨 정보를 삽입할 수 있음 (관리자용)
CREATE POLICY "authenticated users can insert monthly_weather"
  ON monthly_weather FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 인증된 사용자만 월별 날씨 정보를 수정할 수 있음 (관리자용)
CREATE POLICY "authenticated users can update monthly_weather"
  ON monthly_weather FOR UPDATE
  TO authenticated
  USING (true);

-- 인증된 사용자만 월별 날씨 정보를 삭제할 수 있음 (관리자용)
CREATE POLICY "authenticated users can delete monthly_weather"
  ON monthly_weather FOR DELETE
  TO authenticated
  USING (true);

-- ===========================================
-- 트리거: updated_at 자동 갱신
-- ===========================================
CREATE TRIGGER update_monthly_weather_updated_at
  BEFORE UPDATE ON monthly_weather
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
