-- 평가 작성하기 감정 버튼 제거
-- user_ratings 테이블에서 likes 컬럼과 관련 트리거 제거
-- cities.likes/dislikes는 LikeDislikeButtons(user_city_reactions)로만 관리

-- 1. user_ratings 트리거 제거
DROP TRIGGER IF EXISTS update_city_likes_from_ratings_trigger ON user_ratings;
DROP FUNCTION IF EXISTS update_city_likes_from_ratings();

-- 2. likes 컬럼 제거
ALTER TABLE user_ratings DROP COLUMN IF EXISTS likes;

-- 3. 테이블 코멘트 업데이트
COMMENT ON TABLE user_ratings IS '사용자 평가 테이블 (별점만 저장)';
