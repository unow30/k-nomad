-- Phase 1: 관리자 기능을 위한 스키마 추가

-- 1. 사용자 역할(role) enum 타입 생성
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- 2. public.users 테이블에 role 컬럼 추가
ALTER TABLE public.users
ADD COLUMN role user_role NOT NULL DEFAULT 'user';

-- 3. role 컬럼에 인덱스 추가 (관리자 확인을 위한 성능 최적화)
CREATE INDEX idx_users_role ON public.users(role);

-- 4. user_reviews 테이블에 hidden 컬럼 추가
ALTER TABLE public.user_reviews
ADD COLUMN hidden boolean NOT NULL DEFAULT false;

-- 5. hidden 컬럼에 인덱스 추가 (숨김 상태 필터링 성능 최적화)
CREATE INDEX idx_user_reviews_hidden ON public.user_reviews(hidden);

-- 6. RLS 정책: 일반 사용자는 숨겨지지 않은 리뷰만 볼 수 있음
-- 기존 정책 확인 후 삭제
DROP POLICY IF EXISTS "Users can view reviews" ON public.user_reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.user_reviews;

-- 새로운 정책: 일반 사용자는 숨겨지지 않은 리뷰만 조회
CREATE POLICY "Users can view non-hidden reviews" ON public.user_reviews
  FOR SELECT
  USING (hidden = false);

-- 관리자는 모든 리뷰 조회 가능
CREATE POLICY "Admins can view all reviews" ON public.user_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 7. RLS 정책: 관리자만 리뷰를 숨길 수 있음
CREATE POLICY "Admins can update review visibility" ON public.user_reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 8. RLS 정책: 사용자는 자신의 리뷰만 수정 가능 (hidden 필드 제외)
-- 기존 정책 확인 후 삭제
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.user_reviews;

-- 새로운 정책: 자신의 리뷰 수정 (hidden 필드 변경 불가)
CREATE POLICY "Users can update their own reviews" ON public.user_reviews
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    -- 일반 사용자는 hidden 필드를 변경할 수 없음
    (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.role = 'admin'
      )
      OR hidden = (SELECT hidden FROM public.user_reviews WHERE id = user_reviews.id)
    )
  );

-- 9. 관리자 확인을 위한 헬퍼 함수 생성
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 코멘트 추가
COMMENT ON COLUMN public.users.role IS '사용자 역할 (user: 일반 사용자, admin: 관리자)';
COMMENT ON COLUMN public.user_reviews.hidden IS '관리자가 숨긴 리뷰 여부 (true: 숨김, false: 공개)';
COMMENT ON FUNCTION public.is_admin() IS '현재 로그인한 사용자가 관리자인지 확인하는 헬퍼 함수';
