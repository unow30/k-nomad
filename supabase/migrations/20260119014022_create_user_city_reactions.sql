-- user_city_reactions 테이블 생성
CREATE TABLE IF NOT EXISTS user_city_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  city_like BOOLEAN NOT NULL DEFAULT false,
  city_dislike BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, city_id),
  -- like와 dislike가 동시에 true일 수 없음
  CHECK (NOT (city_like = true AND city_dislike = true))
);

-- RLS (Row Level Security) 활성화
ALTER TABLE user_city_reactions ENABLE ROW LEVEL SECURITY;

-- 자신의 반응만 조회 가능
CREATE POLICY "Users can view their own reactions"
  ON user_city_reactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 자신의 반응만 삽입 가능
CREATE POLICY "Users can insert their own reactions"
  ON user_city_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 자신의 반응만 업데이트 가능
CREATE POLICY "Users can update their own reactions"
  ON user_city_reactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 자신의 반응만 삭제 가능
CREATE POLICY "Users can delete their own reactions"
  ON user_city_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_user_city_reactions_user_id ON user_city_reactions(user_id);
CREATE INDEX idx_user_city_reactions_city_id ON user_city_reactions(city_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
CREATE TRIGGER update_user_city_reactions_updated_at
  BEFORE UPDATE ON user_city_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- cities 테이블의 likes/dislikes 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_city_likes_dislikes()
RETURNS TRIGGER AS $$
DECLARE
  old_like BOOLEAN;
  old_dislike BOOLEAN;
  new_like BOOLEAN;
  new_dislike BOOLEAN;
  like_delta INTEGER := 0;
  dislike_delta INTEGER := 0;
BEGIN
  -- INSERT의 경우
  IF TG_OP = 'INSERT' THEN
    old_like := false;
    old_dislike := false;
    new_like := NEW.city_like;
    new_dislike := NEW.city_dislike;
  -- UPDATE의 경우
  ELSIF TG_OP = 'UPDATE' THEN
    old_like := OLD.city_like;
    old_dislike := OLD.city_dislike;
    new_like := NEW.city_like;
    new_dislike := NEW.city_dislike;
  -- DELETE의 경우
  ELSIF TG_OP = 'DELETE' THEN
    old_like := OLD.city_like;
    old_dislike := OLD.city_dislike;
    new_like := false;
    new_dislike := false;
  END IF;

  -- like 변화 계산
  IF old_like = false AND new_like = true THEN
    like_delta := 1;
  ELSIF old_like = true AND new_like = false THEN
    like_delta := -1;
  END IF;

  -- dislike 변화 계산
  IF old_dislike = false AND new_dislike = true THEN
    dislike_delta := 1;
  ELSIF old_dislike = true AND new_dislike = false THEN
    dislike_delta := -1;
  END IF;

  -- cities 테이블 업데이트
  IF like_delta != 0 OR dislike_delta != 0 THEN
    IF TG_OP = 'DELETE' THEN
      UPDATE cities
      SET
        likes = GREATEST(0, likes + like_delta),
        dislikes = GREATEST(0, dislikes + dislike_delta)
      WHERE id = OLD.city_id;
    ELSE
      UPDATE cities
      SET
        likes = GREATEST(0, likes + like_delta),
        dislikes = GREATEST(0, dislikes + dislike_delta)
      WHERE id = NEW.city_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- cities 테이블 업데이트 트리거
CREATE TRIGGER update_city_likes_dislikes_on_reaction
  AFTER INSERT OR UPDATE OR DELETE ON user_city_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_city_likes_dislikes();
