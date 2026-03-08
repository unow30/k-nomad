-- ===========================================
-- 도시-관측소 매핑 (기상청 ASOS 일자료 연동)
-- ===========================================
-- 기상청 ASOS 일자료 API로 날씨 데이터를 조회하기 위해
-- cities 테이블에 관측소 ID 필드를 추가합니다.

-- 1. cities 테이블에 weather_station_id 컬럼 추가
ALTER TABLE cities
ADD COLUMN weather_station_id INTEGER;

-- 2. 주요 도시에 관측소 코드 매핑
-- 출처: 기상청 지점정보 조회서비스 (https://data.kma.go.kr/tmeta/stn/selectStnList.do)

UPDATE cities SET weather_station_id = 108 WHERE name = '서울';
UPDATE cities SET weather_station_id = 159 WHERE name = '부산';
UPDATE cities SET weather_station_id = 112 WHERE name = '인천';
UPDATE cities SET weather_station_id = 143 WHERE name = '대구';
UPDATE cities SET weather_station_id = 156 WHERE name = '광주';
UPDATE cities SET weather_station_id = 133 WHERE name = '대전';
UPDATE cities SET weather_station_id = 146 WHERE name = '경주';
UPDATE cities SET weather_station_id = 182 WHERE name = '울산';
UPDATE cities SET weather_station_id = 184 WHERE name = '제주';
UPDATE cities SET weather_station_id = 131 WHERE name = '천안';
UPDATE cities SET weather_station_id = 119 WHERE name = '수원';
UPDATE cities SET weather_station_id = 105 WHERE name = '강릉';
UPDATE cities SET weather_station_id = 165 WHERE name = '목포';
UPDATE cities SET weather_station_id = 146 WHERE name = '포항';
UPDATE cities SET weather_station_id = 192 WHERE name = '진주';

-- 3. 인덱스 생성 (조회 성능 향상)
CREATE INDEX idx_cities_weather_station ON cities(weather_station_id)
WHERE weather_station_id IS NOT NULL;

-- 4. 코멘트 추가
COMMENT ON COLUMN cities.weather_station_id IS '기상청 ASOS 관측소 지점번호 (https://data.kma.go.kr/tmeta/stn/selectStnList.do)';
