-- workspace_reviews.user_id FK를 auth.users에서 public.users로 변경
-- (PostgREST가 users 테이블과의 관계를 인식할 수 있도록)
ALTER TABLE workspace_reviews
  DROP CONSTRAINT workspace_reviews_user_id_fkey;

ALTER TABLE workspace_reviews
  ADD CONSTRAINT workspace_reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
