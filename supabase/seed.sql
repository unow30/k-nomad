-- ===========================================
-- 시드 데이터
-- 대한민국 노마드 도시 프로젝트
-- ===========================================

-- 기존 데이터 초기화 (개발 환경용)
TRUNCATE cities RESTART IDENTITY CASCADE;

-- ===========================================
-- 관리자 계정 생성 (개발 환경 전용)
-- ===========================================
--
-- ⚠️  중요: auth.users 테이블에 직접 삽입하는 것은 권장되지 않습니다.
-- Supabase Auth(GoTrue)는 자체 비밀번호 해싱 방식을 사용하며,
-- PostgreSQL의 crypt() 함수로 생성한 해시와 호환되지 않을 수 있습니다.
--
-- 대신 다음 방법을 사용하세요:
-- 1. 스크립트 실행: npm run seed:admin
-- 2. Supabase Dashboard에서 수동으로 사용자 생성
-- 3. 회원가입 페이지에서 직접 가입
--
-- 관리자 계정 정보:
-- - 이메일: admin001@test.ai
-- - 비밀번호: qwer1234(예시)
-- - 역할: admin
--
-- 아래 코드는 주석 처리됨 (Supabase Admin API를 사용하세요)

-- ===========================================
-- 15개 도시 초기 데이터 (PRD 요구사항)
-- ===========================================
INSERT INTO cities (
  name, name_en, region, province, rank, overall_score, review_count,
  monthly_budget, rent_studio, internet_speed, cafe_count, ktx_time,
  likes, dislikes, image_url, tags,
  environment, best_season
) VALUES
  -- 1. 제주시
  (
    '제주시', 'Jeju City', 'jeju', '제주특별자치도', 1, 4.5, 127,
    150, 45, 500, 89, NULL,
    127, 23,
    'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=400&h=300&fit=crop',
    ARRAY['자연환경', '카페천국', '서핑', '조용함', '바다뷰'],
    ARRAY['nature', 'cafe']::environment_type[], 'spring'::season_type
  ),
  -- 2. 서귀포시
  (
    '서귀포시', 'Seogwipo', 'jeju', '제주특별자치도', 2, 4.4, 98,
    140, 42, 450, 67, NULL,
    98, 18,
    'https://images.unsplash.com/photo-1609766418204-94aae0ecfdfc?q=80&w=2532&auto=format&fit=crop',
    ARRAY['자연', '조용함', '힐링', '귤', '바다'],
    ARRAY['nature']::environment_type[], 'fall'::season_type
  ),
  -- 3. 부산
  (
    '부산', 'Busan', 'gyeongsang', '부산광역시', 3, 4.3, 156,
    120, 38, 600, 234, 2.5,
    156, 31,
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    ARRAY['해변', '대도시', '교통편리', '맛집', '야경'],
    ARRAY['urban', 'cafe']::environment_type[], 'summer'::season_type
  ),
  -- 4. 강릉
  (
    '강릉', 'Gangneung', 'gangwon', '강원특별자치도', 4, 4.2, 112,
    100, 35, 400, 145, 2.0,
    112, 18,
    'https://images.unsplash.com/photo-1583426573939-97d09302d76a?w=400&h=300&fit=crop',
    ARRAY['커피', '바다', '조용함', 'KTX', '올림픽'],
    ARRAY['cafe', 'nature']::environment_type[], 'fall'::season_type
  ),
  -- 5. 속초
  (
    '속초', 'Sokcho', 'gangwon', '강원특별자치도', 5, 4.1, 89,
    95, 32, 350, 78, NULL,
    89, 12,
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    ARRAY['자연', '관광', '해변', '설악산', '청초호'],
    ARRAY['nature']::environment_type[], 'summer'::season_type
  ),
  -- 6. 여수
  (
    '여수', 'Yeosu', 'jeolla', '전라남도', 6, 4.1, 94,
    100, 33, 380, 102, 3.0,
    94, 15,
    'https://images.unsplash.com/photo-1590841609987-4ac211afdde1?w=400&h=300&fit=crop',
    ARRAY['야경', '해양', '낭만포차', '케이블카', '섬'],
    ARRAY['urban', 'nature']::environment_type[], 'spring'::season_type
  ),
  -- 7. 전주
  (
    '전주', 'Jeonju', 'jeolla', '전북특별자치도', 7, 3.9, 87,
    95, 30, 450, 156, 2.0,
    87, 15,
    'https://images.unsplash.com/photo-1583562835057-a62d1beffbf3?w=400&h=300&fit=crop',
    ARRAY['한옥마을', '문화', '맛집', '전통', '비빔밥'],
    ARRAY['urban', 'cafe']::environment_type[], 'fall'::season_type
  ),
  -- 8. 대전
  (
    '대전', 'Daejeon', 'chungcheong', '대전광역시', 8, 4.0, 103,
    110, 35, 550, 189, 1.0,
    103, 28,
    'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=300&fit=crop',
    ARRAY['교통허브', 'IT', '대학가', '과학도시', '중심'],
    ARRAY['urban', 'coworking']::environment_type[], 'spring'::season_type
  ),
  -- 9. 대구
  (
    '대구', 'Daegu', 'gyeongsang', '대구광역시', 9, 3.8, 95,
    105, 32, 520, 198, 1.5,
    95, 22,
    'https://images.unsplash.com/photo-1546874177-9e664107314e?w=400&h=300&fit=crop',
    ARRAY['저렴', '대도시', '패션', '치맥', '김광석'],
    ARRAY['urban', 'cafe']::environment_type[], 'fall'::season_type
  ),
  -- 10. 경주
  (
    '경주', 'Gyeongju', 'gyeongsang', '경상북도', 10, 3.9, 78,
    90, 28, 380, 92, 2.0,
    78, 14,
    'https://images.unsplash.com/photo-1590841609987-4ac211afdde1?w=400&h=300&fit=crop',
    ARRAY['역사', '문화재', '조용함', '힐링', '천년'],
    ARRAY['nature', 'cafe']::environment_type[], 'spring'::season_type
  ),
  -- 11. 춘천
  (
    '춘천', 'Chuncheon', 'gangwon', '강원특별자치도', 11, 3.8, 72,
    95, 33, 420, 87, 1.5,
    72, 16,
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
    ARRAY['자연', '닭갈비', '호수', '접근성', '소양강'],
    ARRAY['nature', 'cafe']::environment_type[], 'summer'::season_type
  ),
  -- 12. 목포
  (
    '목포', 'Mokpo', 'jeolla', '전라남도', 12, 3.7, 65,
    88, 27, 360, 76, 2.5,
    65, 12,
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=300&fit=crop',
    ARRAY['항구', '해양', '저렴', 'KTX', '유달산'],
    ARRAY['urban', 'nature']::environment_type[], 'spring'::season_type
  ),
  -- 13. 세종
  (
    '세종', 'Sejong', 'chungcheong', '세종특별자치시', 13, 3.9, 58,
    115, 40, 580, 95, 1.0,
    58, 11,
    'https://images.unsplash.com/photo-1548691905-57c36cc8d935?w=400&h=300&fit=crop',
    ARRAY['신도시', '깨끗함', '인프라', '행정', '계획도시'],
    ARRAY['urban', 'coworking']::environment_type[], 'fall'::season_type
  ),
  -- 14. 포항
  (
    '포항', 'Pohang', 'gyeongsang', '경상북도', 14, 3.6, 54,
    92, 29, 400, 82, 2.5,
    54, 13,
    'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400&h=300&fit=crop',
    ARRAY['해양', '공학', '호미곶', '제철', '대학'],
    ARRAY['urban', 'nature']::environment_type[], 'summer'::season_type
  ),
  -- 15. 통영
  (
    '통영', 'Tongyeong', 'gyeongsang', '경상남도', 15, 3.8, 69,
    93, 30, 350, 71, NULL,
    69, 14,
    'https://images.unsplash.com/photo-1606666476184-7d2940f2db90?q=80&w=1548&auto=format&fit=crop',
    ARRAY['섬', '예술', '해산물', '케이블카', '낭만'],
    ARRAY['nature', 'cafe']::environment_type[], 'spring'::season_type
  );

-- ===========================================
-- city_metrics 초기 데이터
-- ===========================================
INSERT INTO city_metrics (city_id, internet_speed, monthly_budget, rent_studio, current_weather, data_source)
SELECT
  id,
  CASE
    WHEN name = '제주시' THEN 500
    WHEN name = '서귀포시' THEN 450
    WHEN name = '부산' THEN 600
    WHEN name = '강릉' THEN 400
    WHEN name = '속초' THEN 350
    WHEN name = '여수' THEN 380
    WHEN name = '전주' THEN 450
    WHEN name = '대전' THEN 550
    WHEN name = '대구' THEN 520
    WHEN name = '경주' THEN 380
    WHEN name = '춘천' THEN 420
    WHEN name = '목포' THEN 360
    WHEN name = '세종' THEN 580
    WHEN name = '포항' THEN 400
    WHEN name = '통영' THEN 350
  END as internet_speed,
  monthly_budget,
  rent_studio,
  jsonb_build_object(
    'temp',
    CASE
      WHEN name = '제주시' THEN 12
      WHEN name = '서귀포시' THEN 13
      WHEN name = '부산' THEN 8
      WHEN name = '강릉' THEN 2
      WHEN name = '속초' THEN 1
      WHEN name = '여수' THEN 10
      WHEN name = '전주' THEN 4
      WHEN name = '대전' THEN 5
      WHEN name = '대구' THEN 6
      WHEN name = '경주' THEN 5
      WHEN name = '춘천' THEN 0
      WHEN name = '목포' THEN 8
      WHEN name = '세종' THEN 4
      WHEN name = '포항' THEN 6
      WHEN name = '통영' THEN 9
    END,
    'aqi',
    CASE
      WHEN name = '제주시' THEN 42
      WHEN name = '서귀포시' THEN 38
      WHEN name = '부산' THEN 58
      WHEN name = '강릉' THEN 35
      WHEN name = '속초' THEN 32
      WHEN name = '여수' THEN 45
      WHEN name = '전주' THEN 52
      WHEN name = '대전' THEN 61
      WHEN name = '대구' THEN 68
      WHEN name = '경주' THEN 48
      WHEN name = '춘천' THEN 42
      WHEN name = '목포' THEN 44
      WHEN name = '세종' THEN 55
      WHEN name = '포항' THEN 51
      WHEN name = '통영' THEN 40
    END,
    'aqi_label',
    CASE
      WHEN name IN ('제주시', '서귀포시', '강릉', '속초', '경주', '목포', '통영') THEN '좋음'
      WHEN name IN ('여수', '춘천') THEN '좋음'
      ELSE '보통'
    END,
    'rainfall',
    CASE
      WHEN name = '제주시' THEN 120
      WHEN name = '서귀포시' THEN 110
      WHEN name = '부산' THEN 65
      WHEN name = '강릉' THEN 35
      WHEN name = '속초' THEN 25
      WHEN name = '여수' THEN 80
      WHEN name = '전주' THEN 45
      WHEN name = '대전' THEN 50
      WHEN name = '대구' THEN 55
      WHEN name = '경주' THEN 40
      WHEN name = '춘천' THEN 30
      WHEN name = '목포' THEN 75
      WHEN name = '세종' THEN 48
      WHEN name = '포항' THEN 60
      WHEN name = '통영' THEN 85
    END
  ) as current_weather,
  'api'
FROM cities;
-- ===========================================
-- monthly_weather 시드 데이터
-- 15개 도시 × 12개월 = 180개 레코드
-- ===========================================

-- 제주시
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, 3, 8, -2, 45, 'seed'
FROM cities WHERE name = '제주시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, 4, 10, -1, 50, 'seed'
FROM cities WHERE name = '제주시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 9, 15, 3, 60, 'seed'
FROM cities WHERE name = '제주시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 15, 22, 8, 75, 'seed'
FROM cities WHERE name = '제주시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 20, 27, 13, 100, 'seed'
FROM cities WHERE name = '제주시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 23, 29, 18, 160, 'seed'
FROM cities WHERE name = '제주시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 27, 32, 22, 220, 'seed'
FROM cities WHERE name = '제주시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 28, 33, 23, 190, 'seed'
FROM cities WHERE name = '제주시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 24, 29, 19, 110, 'seed'
FROM cities WHERE name = '제주시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 18, 24, 12, 80, 'seed'
FROM cities WHERE name = '제주시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 12, 18, 6, 50, 'seed'
FROM cities WHERE name = '제주시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, 5, 11, 0, 40, 'seed'
FROM cities WHERE name = '제주시';

-- 서귀포시
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, 2, 8, -4, 30, 'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, 3, 10, -3, 35, 'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 8, 15, 1, 50, 'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 14, 21, 7, 65, 'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 19, 26, 12, 90, 'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 23, 29, 17, 140, 'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 27, 32, 21, 180, 'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 28, 33, 22, 160, 'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 23, 28, 18, 100, 'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 17, 23, 11, 50, 'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 11, 17, 5, 40, 'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, 4, 10, -1, 30, 'seed'
FROM cities WHERE name = '서귀포시';

-- 부산
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, -3, 3, -8, 20, 'seed'
FROM cities WHERE name = '부산';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, -2, 5, -7, 25, 'seed'
FROM cities WHERE name = '부산';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 4, 11, -2, 40, 'seed'
FROM cities WHERE name = '부산';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 11, 19, 4, 55, 'seed'
FROM cities WHERE name = '부산';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 17, 25, 10, 85, 'seed'
FROM cities WHERE name = '부산';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 21, 28, 15, 130, 'seed'
FROM cities WHERE name = '부산';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 25, 31, 20, 170, 'seed'
FROM cities WHERE name = '부산';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 26, 32, 21, 140, 'seed'
FROM cities WHERE name = '부산';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 21, 26, 16, 80, 'seed'
FROM cities WHERE name = '부산';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 15, 21, 9, 45, 'seed'
FROM cities WHERE name = '부산';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 8, 14, 2, 30, 'seed'
FROM cities WHERE name = '부산';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, 0, 6, -5, 20, 'seed'
FROM cities WHERE name = '부산';

-- 강릉
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, -5, 2, -10, 25, 'seed'
FROM cities WHERE name = '강릉';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, -3, 4, -9, 30, 'seed'
FROM cities WHERE name = '강릉';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 3, 11, -3, 45, 'seed'
FROM cities WHERE name = '강릉';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 10, 18, 3, 60, 'seed'
FROM cities WHERE name = '강릉';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 16, 24, 9, 90, 'seed'
FROM cities WHERE name = '강릉';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 20, 27, 14, 140, 'seed'
FROM cities WHERE name = '강릉';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 24, 30, 19, 180, 'seed'
FROM cities WHERE name = '강릉';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 25, 31, 20, 160, 'seed'
FROM cities WHERE name = '강릉';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 20, 25, 15, 90, 'seed'
FROM cities WHERE name = '강릉';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 14, 20, 8, 50, 'seed'
FROM cities WHERE name = '강릉';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 7, 13, 1, 35, 'seed'
FROM cities WHERE name = '강릉';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, -2, 5, -7, 25, 'seed'
FROM cities WHERE name = '강릉';

-- 속초
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, -6, 1, -11, 20, 'seed'
FROM cities WHERE name = '속초';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, -4, 3, -10, 25, 'seed'
FROM cities WHERE name = '속초';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 2, 10, -4, 40, 'seed'
FROM cities WHERE name = '속초';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 9, 17, 2, 55, 'seed'
FROM cities WHERE name = '속초';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 15, 23, 8, 85, 'seed'
FROM cities WHERE name = '속초';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 19, 26, 13, 130, 'seed'
FROM cities WHERE name = '속초';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 23, 29, 18, 170, 'seed'
FROM cities WHERE name = '속초';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 24, 30, 19, 150, 'seed'
FROM cities WHERE name = '속초';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 19, 24, 14, 85, 'seed'
FROM cities WHERE name = '속초';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 13, 19, 7, 45, 'seed'
FROM cities WHERE name = '속초';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 6, 12, 0, 30, 'seed'
FROM cities WHERE name = '속초';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, -3, 4, -8, 20, 'seed'
FROM cities WHERE name = '속초';

-- 여수
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, 0, 6, -5, 35, 'seed'
FROM cities WHERE name = '여수';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, 1, 8, -4, 40, 'seed'
FROM cities WHERE name = '여수';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 6, 13, 0, 55, 'seed'
FROM cities WHERE name = '여수';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 12, 20, 6, 70, 'seed'
FROM cities WHERE name = '여수';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 18, 25, 11, 95, 'seed'
FROM cities WHERE name = '여수';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 22, 28, 16, 145, 'seed'
FROM cities WHERE name = '여수';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 26, 31, 21, 190, 'seed'
FROM cities WHERE name = '여수';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 27, 32, 22, 170, 'seed'
FROM cities WHERE name = '여수';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 22, 27, 17, 95, 'seed'
FROM cities WHERE name = '여수';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 16, 22, 10, 55, 'seed'
FROM cities WHERE name = '여수';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 10, 16, 4, 45, 'seed'
FROM cities WHERE name = '여수';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, 2, 9, -3, 35, 'seed'
FROM cities WHERE name = '여수';

-- 전주
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, -4, 3, -9, 25, 'seed'
FROM cities WHERE name = '전주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, -2, 6, -8, 30, 'seed'
FROM cities WHERE name = '전주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 4, 12, -2, 45, 'seed'
FROM cities WHERE name = '전주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 11, 20, 4, 65, 'seed'
FROM cities WHERE name = '전주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 17, 26, 10, 95, 'seed'
FROM cities WHERE name = '전주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 22, 29, 15, 150, 'seed'
FROM cities WHERE name = '전주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 26, 32, 20, 200, 'seed'
FROM cities WHERE name = '전주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 27, 33, 21, 180, 'seed'
FROM cities WHERE name = '전주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 22, 27, 16, 100, 'seed'
FROM cities WHERE name = '전주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 15, 22, 9, 50, 'seed'
FROM cities WHERE name = '전주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 8, 15, 2, 35, 'seed'
FROM cities WHERE name = '전주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, -1, 6, -6, 25, 'seed'
FROM cities WHERE name = '전주';

-- 대전
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, -5, 2, -10, 20, 'seed'
FROM cities WHERE name = '대전';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, -3, 5, -9, 25, 'seed'
FROM cities WHERE name = '대전';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 3, 12, -3, 40, 'seed'
FROM cities WHERE name = '대전';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 10, 20, 3, 60, 'seed'
FROM cities WHERE name = '대전';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 16, 26, 9, 90, 'seed'
FROM cities WHERE name = '대전';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 21, 29, 14, 140, 'seed'
FROM cities WHERE name = '대전';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 25, 32, 19, 190, 'seed'
FROM cities WHERE name = '대전';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 26, 33, 20, 170, 'seed'
FROM cities WHERE name = '대전';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 21, 27, 15, 95, 'seed'
FROM cities WHERE name = '대전';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 14, 21, 8, 45, 'seed'
FROM cities WHERE name = '대전';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 7, 14, 1, 30, 'seed'
FROM cities WHERE name = '대전';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, -2, 5, -7, 20, 'seed'
FROM cities WHERE name = '대전';

-- 대구
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, -4, 4, -9, 15, 'seed'
FROM cities WHERE name = '대구';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, -2, 7, -8, 20, 'seed'
FROM cities WHERE name = '대구';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 4, 13, -2, 35, 'seed'
FROM cities WHERE name = '대구';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 11, 21, 4, 50, 'seed'
FROM cities WHERE name = '대구';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 17, 27, 10, 75, 'seed'
FROM cities WHERE name = '대구';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 22, 30, 15, 120, 'seed'
FROM cities WHERE name = '대구';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 26, 33, 20, 170, 'seed'
FROM cities WHERE name = '대구';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 27, 34, 21, 150, 'seed'
FROM cities WHERE name = '대구';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 22, 28, 16, 85, 'seed'
FROM cities WHERE name = '대구';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 15, 22, 9, 40, 'seed'
FROM cities WHERE name = '대구';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 8, 15, 2, 25, 'seed'
FROM cities WHERE name = '대구';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, -1, 6, -6, 15, 'seed'
FROM cities WHERE name = '대구';

-- 경주
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, -3, 5, -8, 20, 'seed'
FROM cities WHERE name = '경주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, -1, 8, -7, 25, 'seed'
FROM cities WHERE name = '경주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 5, 14, -1, 40, 'seed'
FROM cities WHERE name = '경주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 12, 21, 5, 55, 'seed'
FROM cities WHERE name = '경주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 18, 27, 11, 80, 'seed'
FROM cities WHERE name = '경주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 22, 30, 16, 130, 'seed'
FROM cities WHERE name = '경주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 26, 33, 20, 180, 'seed'
FROM cities WHERE name = '경주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 27, 34, 21, 160, 'seed'
FROM cities WHERE name = '경주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 22, 28, 16, 90, 'seed'
FROM cities WHERE name = '경주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 16, 23, 10, 45, 'seed'
FROM cities WHERE name = '경주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 9, 16, 3, 30, 'seed'
FROM cities WHERE name = '경주';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, 1, 8, -5, 20, 'seed'
FROM cities WHERE name = '경주';

-- 춘천
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, -7, 0, -12, 15, 'seed'
FROM cities WHERE name = '춘천';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, -5, 3, -11, 20, 'seed'
FROM cities WHERE name = '춘천';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 1, 10, -5, 35, 'seed'
FROM cities WHERE name = '춘천';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 8, 18, 1, 50, 'seed'
FROM cities WHERE name = '춘천';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 14, 24, 7, 80, 'seed'
FROM cities WHERE name = '춘천';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 19, 27, 12, 130, 'seed'
FROM cities WHERE name = '춘천';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 23, 30, 17, 180, 'seed'
FROM cities WHERE name = '춘천';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 24, 31, 18, 160, 'seed'
FROM cities WHERE name = '춘천';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 19, 25, 13, 90, 'seed'
FROM cities WHERE name = '춘천';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 12, 19, 6, 40, 'seed'
FROM cities WHERE name = '춘천';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 5, 12, -1, 25, 'seed'
FROM cities WHERE name = '춘천';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, -4, 3, -9, 15, 'seed'
FROM cities WHERE name = '춘천';

-- 목포
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, -1, 6, -6, 30, 'seed'
FROM cities WHERE name = '목포';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, 0, 8, -5, 35, 'seed'
FROM cities WHERE name = '목포';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 5, 13, -1, 50, 'seed'
FROM cities WHERE name = '목포';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 11, 19, 5, 65, 'seed'
FROM cities WHERE name = '목포';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 17, 24, 10, 90, 'seed'
FROM cities WHERE name = '목포';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 21, 27, 15, 140, 'seed'
FROM cities WHERE name = '목포';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 25, 30, 20, 185, 'seed'
FROM cities WHERE name = '목포';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 26, 31, 21, 165, 'seed'
FROM cities WHERE name = '목포';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 21, 26, 16, 90, 'seed'
FROM cities WHERE name = '목포';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 15, 21, 9, 50, 'seed'
FROM cities WHERE name = '목포';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 9, 15, 3, 40, 'seed'
FROM cities WHERE name = '목포';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, 1, 8, -4, 30, 'seed'
FROM cities WHERE name = '목포';

-- 세종
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, -6, 1, -11, 18, 'seed'
FROM cities WHERE name = '세종';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, -4, 4, -10, 22, 'seed'
FROM cities WHERE name = '세종';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 2, 11, -4, 38, 'seed'
FROM cities WHERE name = '세종';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 9, 19, 2, 58, 'seed'
FROM cities WHERE name = '세종';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 15, 25, 8, 88, 'seed'
FROM cities WHERE name = '세종';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 20, 28, 13, 138, 'seed'
FROM cities WHERE name = '세종';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 24, 31, 18, 188, 'seed'
FROM cities WHERE name = '세종';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 25, 32, 19, 168, 'seed'
FROM cities WHERE name = '세종';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 20, 26, 14, 93, 'seed'
FROM cities WHERE name = '세종';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 13, 20, 7, 43, 'seed'
FROM cities WHERE name = '세종';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 6, 13, 0, 28, 'seed'
FROM cities WHERE name = '세종';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, -3, 4, -8, 18, 'seed'
FROM cities WHERE name = '세종';

-- 포항
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, -2, 6, -7, 22, 'seed'
FROM cities WHERE name = '포항';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, 0, 9, -6, 27, 'seed'
FROM cities WHERE name = '포항';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 6, 15, 0, 42, 'seed'
FROM cities WHERE name = '포항';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 13, 22, 6, 58, 'seed'
FROM cities WHERE name = '포항';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 19, 28, 12, 83, 'seed'
FROM cities WHERE name = '포항';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 23, 31, 17, 133, 'seed'
FROM cities WHERE name = '포항';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 27, 34, 21, 183, 'seed'
FROM cities WHERE name = '포항';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 28, 35, 22, 163, 'seed'
FROM cities WHERE name = '포항';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 23, 29, 17, 93, 'seed'
FROM cities WHERE name = '포항';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 17, 24, 11, 47, 'seed'
FROM cities WHERE name = '포항';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 10, 17, 4, 32, 'seed'
FROM cities WHERE name = '포항';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, 2, 9, -4, 22, 'seed'
FROM cities WHERE name = '포항';

-- 통영
INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 1, 1, 7, -4, 28, 'seed'
FROM cities WHERE name = '통영';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 2, 2, 9, -3, 33, 'seed'
FROM cities WHERE name = '통영';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 3, 7, 14, 1, 48, 'seed'
FROM cities WHERE name = '통영';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 4, 13, 20, 7, 63, 'seed'
FROM cities WHERE name = '통영';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 5, 19, 26, 13, 88, 'seed'
FROM cities WHERE name = '통영';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 6, 23, 29, 18, 138, 'seed'
FROM cities WHERE name = '통영';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 7, 27, 32, 22, 188, 'seed'
FROM cities WHERE name = '통영';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 8, 28, 33, 23, 168, 'seed'
FROM cities WHERE name = '통영';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 9, 23, 28, 18, 93, 'seed'
FROM cities WHERE name = '통영';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 10, 17, 23, 12, 48, 'seed'
FROM cities WHERE name = '통영';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 11, 11, 17, 6, 38, 'seed'
FROM cities WHERE name = '통영';

INSERT INTO monthly_weather (city_id, month, avg_temp, max_temp, min_temp, rainfall, data_source)
SELECT id, 12, 3, 10, -2, 28, 'seed'
FROM cities WHERE name = '통영';

-- ===========================================
-- workspaces 시드 데이터
-- 주요 도시별 작업 공간 정보
-- ===========================================

-- 제주시 작업 공간
INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, website, latitude, longitude, image_url, data_source)
SELECT
  id,
  '카페 모모스',
  'Cafe Momos',
  'cafe'::workspace_type,
  '제주시 구좌읍 해맞이해안로 1864',
  '제주 동부 해안가에 위치한 오션뷰 카페. 넓은 작업 공간과 빠른 WiFi 제공.',
  300,
  true,
  'low'::price_range_type,
  '매일 08:00-21:00',
  '064-782-0000',
  'https://example.com/momos',
  33.5308,
  126.8751,
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '제주시';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, website, latitude, longitude, image_url, data_source)
SELECT
  id,
  '스페이스 노마드',
  'Space Nomad',
  'coworking'::workspace_type,
  '제주시 첨단로 213-4',
  '제주시내 중심가 코워킹 스페이스. 24시간 운영 및 미팅룸 제공.',
  500,
  true,
  'medium'::price_range_type,
  '24시간',
  '064-720-1234',
  'https://example.com/spacenomad',
  33.4996,
  126.5312,
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '제주시';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '제주시 탐라도서관',
  'Jeju Tamra Library',
  'library'::workspace_type,
  '제주시 삼성로 40',
  '조용한 학습 환경과 안정적인 인터넷 제공. 무료 이용 가능.',
  200,
  true,
  'free'::price_range_type,
  '평일 09:00-22:00, 주말 09:00-18:00',
  '064-710-3000',
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '제주시';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '베이직커피랩',
  'Basic Coffee Lab',
  'cafe'::workspace_type,
  '제주시 중앙로 273',
  '깔끔한 인테리어의 스페셜티 커피 전문점. 조용하고 집중하기 좋은 분위기.',
  350,
  true,
  'low'::price_range_type,
  '평일 08:00-21:00, 주말 09:00-20:00',
  '064-757-2233',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '제주시';

-- 서귀포시 작업 공간
INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '카페 오션뷰',
  'Cafe Ocean View',
  'cafe'::workspace_type,
  '서귀포시 중문관광로 154-17',
  '중문 해변이 보이는 작업 공간. 자연광이 풍부하고 콘센트 넉넉.',
  280,
  true,
  'low'::price_range_type,
  '매일 09:00-20:00',
  '064-738-5555',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '숲속도서관',
  'Forest Library',
  'library'::workspace_type,
  '서귀포시 서홍동 564-1',
  '한라산 인근 조용한 도서관. 자연 속에서 집중 작업 가능.',
  180,
  true,
  'free'::price_range_type,
  '평일 09:00-18:00',
  '064-760-3456',
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '서귀포시';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '그린티하우스',
  'Green Tea House',
  'cafe'::workspace_type,
  '서귀포시 안덕면 산록남로 921',
  '녹차밭이 보이는 조용한 카페. 장시간 작업에 적합.',
  250,
  true,
  'low'::price_range_type,
  '매일 10:00-19:00',
  '064-794-3300',
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '서귀포시';

-- 부산 작업 공간
INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, website, image_url, data_source)
SELECT
  id,
  '패스트파이브 부산',
  'FastFive Busan',
  'coworking'::workspace_type,
  '부산 해운대구 센텀중앙로 78',
  '센텀시티 코워킹 스페이스. 프라이빗 룸과 미팅룸 완비.',
  600,
  true,
  'high'::price_range_type,
  '평일 09:00-19:00',
  '051-731-5555',
  'https://example.com/fastfive-busan',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '부산';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '카페 더베이',
  'Cafe The Bay',
  'cafe'::workspace_type,
  '부산 해운대구 달맞이길 30',
  '해운대 바다가 보이는 루프탑 카페. 야경도 멋짐.',
  320,
  true,
  'medium'::price_range_type,
  '매일 10:00-23:00',
  '051-746-7890',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '부산';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '부산시립중앙도서관',
  'Busan Central Library',
  'library'::workspace_type,
  '부산 부산진구 연지로 60',
  '대형 시립 도서관. 스터디룸과 조용한 열람실 보유.',
  250,
  true,
  'free'::price_range_type,
  '평일 09:00-22:00, 주말 09:00-18:00',
  '051-860-2000',
  'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '부산';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '커피빈 광안점',
  'Coffee Bean Gwangan',
  'cafe'::workspace_type,
  '부산 수영구 광안해변로 219',
  '광안리 해변 앞 체인 카페. WiFi 빠르고 콘센트 많음.',
  400,
  true,
  'low'::price_range_type,
  '매일 07:00-23:00',
  '051-754-8800',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '부산';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '스페이스88',
  'Space88',
  'coworking'::workspace_type,
  '부산 수영구 망미번영로 88',
  '망미동 주택가 근처 조용한 소형 코워킹. 저렴한 가격.',
  450,
  true,
  'low'::price_range_type,
  '평일 08:00-20:00',
  '051-759-1188',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '부산';

-- 강릉 작업 공간
INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '테라로사 커피공장',
  'Terarosa Coffee Factory',
  'cafe'::workspace_type,
  '강릉시 구정면 현천길 7',
  '강릉의 유명 로스터리 카페. 넓은 공간과 조용한 분위기.',
  350,
  true,
  'medium'::price_range_type,
  '매일 09:00-21:00',
  '033-648-2760',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '강릉';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '보헤미안 로스터스',
  'Bohemian Roasters',
  'cafe'::workspace_type,
  '강릉시 창해로 14번길 10-1',
  '경포호 근처 스페셜티 커피 전문점. 작업하기 좋은 창가 자리 많음.',
  300,
  true,
  'low'::price_range_type,
  '매일 08:00-20:00',
  '033-655-1122',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '강릉';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '강릉시립도서관',
  'Gangneung City Library',
  'library'::workspace_type,
  '강릉시 경강로 2021',
  '현대적인 시설의 시립 도서관. 스터디카페 분위기.',
  200,
  true,
  'free'::price_range_type,
  '평일 09:00-22:00, 주말 09:00-18:00',
  '033-640-4500',
  'https://images.unsplash.com/photo-1577985043696-0d29c955127c?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '강릉';

-- 속초 작업 공간
INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '카페 스케이프',
  'Cafe Scape',
  'cafe'::workspace_type,
  '속초시 중앙로 28',
  '속초 시내 중심가 카페. WiFi 빠르고 전원 넉넉.',
  300,
  true,
  'low'::price_range_type,
  '매일 08:00-22:00',
  '033-636-2233',
  'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '속초';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '속초시립도서관',
  'Sokcho City Library',
  'library'::workspace_type,
  '속초시 중앙로 46',
  '조용한 학습 공간. 청초호 근처 접근성 좋음.',
  180,
  true,
  'free'::price_range_type,
  '평일 09:00-20:00, 주말 09:00-18:00',
  '033-639-3300',
  'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '속초';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '씨뷰카페 속초',
  'Sea View Cafe Sokcho',
  'cafe'::workspace_type,
  '속초시 대포항길 123',
  '대포항 앞 오션뷰 카페. 파도 소리 들으며 작업 가능.',
  250,
  true,
  'low'::price_range_type,
  '매일 09:00-21:00',
  '033-633-7788',
  'https://images.unsplash.com/photo-1464618663641-bbdd760ae84a?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '속초';

-- 여수 작업 공간
INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '카페 바다애',
  'Cafe Badaae',
  'cafe'::workspace_type,
  '여수시 돌산읍 무슬목길 142',
  '여수 바다가 보이는 카페. 야경도 멋지고 작업하기 좋음.',
  280,
  true,
  'low'::price_range_type,
  '매일 10:00-22:00',
  '061-644-5566',
  'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '여수';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '여수시립도서관',
  'Yeosu City Library',
  'library'::workspace_type,
  '여수시 시청로 1',
  '깨끗한 시설의 시립 도서관. 열람실 넓음.',
  200,
  true,
  'free'::price_range_type,
  '평일 09:00-22:00, 주말 09:00-18:00',
  '061-659-3900',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '여수';

INSERT INTO workspaces (city_id, name, name_en, type, address, description, wifi_speed, has_power, price_range, opening_hours, phone, image_url, data_source)
SELECT
  id,
  '스타벅스 여수웅천점',
  'Starbucks Yeosu Ungcheon',
  'cafe'::workspace_type,
  '여수시 웅천중앙로 1',
  '여수 시내 체인 카페. WiFi 안정적이고 좌석 많음.',
  400,
  true,
  'low'::price_range_type,
  '매일 07:00-23:00',
  '061-663-8800',
  'https://images.unsplash.com/photo-1459257831348-f0cdd359235f?w=400&h=300&fit=crop',
  'seed'
FROM cities WHERE name = '여수';
