-- current_weather JSONB 필드 추가
ALTER TABLE city_metrics
ADD COLUMN current_weather JSONB;

-- 기존 데이터 마이그레이션 (rainfall은 0~150mm 랜덤값)
UPDATE city_metrics
SET current_weather = jsonb_build_object(
  'temp', COALESCE(current_temp, 15),
  'aqi', COALESCE(aqi, 50),
  'aqi_label', COALESCE(aqi_label, '보통'),
  'rainfall', FLOOR(RANDOM() * 150)::INTEGER
)
WHERE current_weather IS NULL;

-- NOT NULL 제약 추가
ALTER TABLE city_metrics
ALTER COLUMN current_weather SET NOT NULL;

-- JSONB 구조 검증 제약
ALTER TABLE city_metrics
ADD CONSTRAINT check_current_weather_structure CHECK (
  current_weather ? 'temp' AND
  current_weather ? 'aqi' AND
  current_weather ? 'aqi_label' AND
  current_weather ? 'rainfall'
);

-- JSONB 필드 인덱스 (쿼리 성능 향상)
CREATE INDEX idx_city_metrics_current_weather_temp
ON city_metrics ((current_weather->>'temp'));

CREATE INDEX idx_city_metrics_current_weather_aqi
ON city_metrics ((current_weather->>'aqi'));

-- 기존 필드를 DEPRECATED로 마킹
COMMENT ON COLUMN city_metrics.current_temp IS 'DEPRECATED: Use current_weather.temp instead';
COMMENT ON COLUMN city_metrics.aqi IS 'DEPRECATED: Use current_weather.aqi instead';
COMMENT ON COLUMN city_metrics.aqi_label IS 'DEPRECATED: Use current_weather.aqi_label instead';
