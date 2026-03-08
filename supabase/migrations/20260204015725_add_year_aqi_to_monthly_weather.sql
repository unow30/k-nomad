-- Add year and aqi fields to monthly_weather table

-- Add year column (기록 연도)
ALTER TABLE monthly_weather
ADD COLUMN year INTEGER NOT NULL DEFAULT 2025;

-- Add aqi column (대기질 지수)
ALTER TABLE monthly_weather
ADD COLUMN aqi INTEGER;

-- Add comments
COMMENT ON COLUMN monthly_weather.year IS '기록 연도';
COMMENT ON COLUMN monthly_weather.aqi IS '대기질 지수 (Air Quality Index)';

-- Update existing data with year 2025 and random AQI values
UPDATE monthly_weather
SET
  year = 2025,
  aqi = CASE
    -- 제주/서귀포: 좋음 (30-50)
    WHEN city_id IN (SELECT id FROM cities WHERE name IN ('제주시', '서귀포시'))
      THEN 30 + (EXTRACT(EPOCH FROM created_at)::INTEGER % 20)

    -- 강릉, 속초, 경주, 춘천, 목포, 통영: 좋음-보통 (35-60)
    WHEN city_id IN (SELECT id FROM cities WHERE name IN ('강릉', '속초', '경주', '춘천', '목포', '통영'))
      THEN 35 + (EXTRACT(EPOCH FROM created_at)::INTEGER % 25)

    -- 여수, 전주, 세종, 포항: 보통 (50-75)
    WHEN city_id IN (SELECT id FROM cities WHERE name IN ('여수', '전주', '세종', '포항'))
      THEN 50 + (EXTRACT(EPOCH FROM created_at)::INTEGER % 25)

    -- 부산, 대전, 대구: 보통-나쁨 (55-85)
    ELSE 55 + (EXTRACT(EPOCH FROM created_at)::INTEGER % 30)
  END;

-- Create index for faster queries by year
CREATE INDEX IF NOT EXISTS idx_monthly_weather_year ON monthly_weather(year);

-- Create composite index for common query patterns (city + year + month)
CREATE INDEX IF NOT EXISTS idx_monthly_weather_city_year_month
ON monthly_weather(city_id, year, month);
