-- RLS 정책 위반 해결: users 테이블 제거, profiles로 통일
-- user_reviews, user_ratings, user_city_reactions의 FK를 profiles 참조로 변경

-- Step 1: user_reviews FK 재설정
ALTER TABLE user_reviews
  DROP CONSTRAINT IF EXISTS user_reviews_user_id_fkey;

ALTER TABLE user_reviews
  ADD CONSTRAINT user_reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 2: user_ratings FK 재설정
ALTER TABLE user_ratings
  DROP CONSTRAINT IF EXISTS user_ratings_user_id_fkey;

ALTER TABLE user_ratings
  ADD CONSTRAINT user_ratings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 3: user_city_reactions FK 재설정
ALTER TABLE user_city_reactions
  DROP CONSTRAINT IF EXISTS user_city_reactions_user_id_fkey;

ALTER TABLE user_city_reactions
  ADD CONSTRAINT user_city_reactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 4: users 테이블 관련 정리
-- 트리거 제거
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users;

-- 함수 제거
DROP FUNCTION IF EXISTS handle_new_user_v2();

-- users 테이블 제거
DROP TABLE IF EXISTS users;

-- 참고: profiles 테이블과 handle_new_user() 트리거는 initial_schema에서 이미 정의되어 있으므로 유지
