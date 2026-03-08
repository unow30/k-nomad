-- ===========================================
-- 필터 필드 추가
-- environment, best_season 필드 추가
-- ===========================================

-- 환경 타입 ENUM
CREATE TYPE environment_type AS ENUM (
  'nature',
  'urban',
  'cafe',
  'coworking'
);

-- 계절 타입 ENUM
CREATE TYPE season_type AS ENUM (
  'spring',
  'summer',
  'fall',
  'winter'
);

-- cities 테이블에 필드 추가
ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS environment environment_type[],
  ADD COLUMN IF NOT EXISTS best_season season_type;

-- 인덱스 추가 (필터링 성능 향상)
CREATE INDEX IF NOT EXISTS idx_cities_environment ON cities USING GIN (environment);
CREATE INDEX IF NOT EXISTS idx_cities_best_season ON cities(best_season);
