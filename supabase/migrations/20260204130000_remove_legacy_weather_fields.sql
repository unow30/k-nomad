-- Remove deprecated weather fields from city_metrics and cities tables
-- These fields have been replaced by the current_weather JSONB column in city_metrics

-- Remove the deprecated columns from city_metrics
ALTER TABLE city_metrics
DROP COLUMN IF EXISTS current_temp,
DROP COLUMN IF EXISTS aqi,
DROP COLUMN IF EXISTS aqi_label;

-- Remove the deprecated columns from cities
ALTER TABLE cities
DROP COLUMN IF EXISTS current_temp,
DROP COLUMN IF EXISTS aqi,
DROP COLUMN IF EXISTS aqi_label;
