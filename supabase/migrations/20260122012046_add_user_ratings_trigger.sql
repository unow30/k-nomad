-- user_ratings 테이블의 likes 필드가 변경될 때 cities 테이블의 likes/dislikes 자동 업데이트
-- likes 값: -1 (싫어요), 0 (중립), 1 (좋아요)

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_city_likes_from_ratings()
RETURNS TRIGGER AS $$
DECLARE
  old_likes_value INTEGER;
  new_likes_value INTEGER;
  like_delta INTEGER := 0;
  dislike_delta INTEGER := 0;
  target_city_id UUID;
BEGIN
  -- 작업 유형에 따라 값 설정
  IF TG_OP = 'INSERT' THEN
    old_likes_value := 0;
    new_likes_value := NEW.likes;
    target_city_id := NEW.city_id;
  ELSIF TG_OP = 'UPDATE' THEN
    old_likes_value := OLD.likes;
    new_likes_value := NEW.likes;
    target_city_id := NEW.city_id;
  ELSIF TG_OP = 'DELETE' THEN
    old_likes_value := OLD.likes;
    new_likes_value := 0;
    target_city_id := OLD.city_id;
  END IF;

  -- 변화량 계산 (likes: -1=싫어요, 0=중립, 1=좋아요)
  -- 이전 값 제거
  IF old_likes_value = 1 THEN
    like_delta := -1;  -- 이전 좋아요 제거
  ELSIF old_likes_value = -1 THEN
    dislike_delta := -1;  -- 이전 싫어요 제거
  END IF;

  -- 새 값 추가
  IF new_likes_value = 1 THEN
    like_delta := like_delta + 1;  -- 새 좋아요 추가
  ELSIF new_likes_value = -1 THEN
    dislike_delta := dislike_delta + 1;  -- 새 싫어요 추가
  END IF;

  -- cities 테이블 업데이트 (변경사항이 있을 때만)
  IF like_delta != 0 OR dislike_delta != 0 THEN
    UPDATE cities
    SET
      likes = GREATEST(0, COALESCE(likes, 0) + like_delta),
      dislikes = GREATEST(0, COALESCE(dislikes, 0) + dislike_delta),
      updated_at = NOW()
    WHERE id = target_city_id;
  END IF;

  -- 트리거 반환값
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (INSERT, UPDATE, DELETE 모두 감지)
CREATE TRIGGER update_city_likes_from_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_city_likes_from_ratings();

-- 성능 향상을 위한 복합 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_user_ratings_city_user_composite
  ON user_ratings(city_id, user_id);

-- 코멘트 추가 (문서화)
COMMENT ON FUNCTION update_city_likes_from_ratings() IS
  'user_ratings 테이블의 likes 필드 변경 시 cities 테이블의 likes/dislikes를 자동 업데이트합니다. likes 값: -1 (싫어요), 0 (중립), 1 (좋아요)';

COMMENT ON TRIGGER update_city_likes_from_ratings_trigger ON user_ratings IS
  '평가 생성/수정/삭제 시 cities 테이블의 좋아요/싫어요 카운트를 자동으로 동기화합니다.';
