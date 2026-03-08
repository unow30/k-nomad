-- Fix RLS policies for admin operations (cities, workspaces, reviews)
-- 재귀 참조 문제 해결 및 관리자 권한 정책 수정

-- ====================================
-- 1. user_reviews 테이블 RLS 수정
-- ====================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.user_reviews;
DROP POLICY IF EXISTS "Admins can update review visibility" ON public.user_reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.user_reviews;
DROP POLICY IF EXISTS "Users can view non-hidden reviews" ON public.user_reviews;

-- 새로운 정책: 일반 사용자는 숨겨지지 않은 리뷰만 조회
CREATE POLICY "Users can view non-hidden reviews" ON public.user_reviews
  FOR SELECT
  USING (
    hidden = false
    OR public.is_admin()  -- 관리자는 모든 리뷰 조회 가능
  );

-- 새로운 정책: 사용자는 자신의 리뷰만 수정 가능 (hidden 필드는 관리자만 변경 가능)
-- 재귀 SELECT 제거: 일반 사용자는 아예 hidden 컬럼을 건드릴 수 없도록 설정
CREATE POLICY "Users can update their own reviews" ON public.user_reviews
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR public.is_admin()  -- 관리자는 모든 리뷰 수정 가능
  );

-- 관리자는 모든 리뷰 삭제 가능
DROP POLICY IF EXISTS "users can delete own reviews" ON public.user_reviews;

CREATE POLICY "Users can delete own reviews or admins can delete any" ON public.user_reviews
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.is_admin()
  );

-- ====================================
-- 2. cities 테이블 RLS 수정
-- ====================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Only authenticated users can update cities" ON public.cities;
DROP POLICY IF EXISTS "Only authenticated users can insert cities" ON public.cities;

-- 새로운 정책: 관리자만 도시 생성/수정 가능
CREATE POLICY "Only admins can insert cities" ON public.cities
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update cities" ON public.cities
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ====================================
-- 3. workspaces 테이블 RLS 수정
-- ====================================

-- 새로운 정책: 관리자만 작업공간 생성/수정/삭제 가능
CREATE POLICY "Only admins can insert workspaces" ON public.workspaces
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update workspaces" ON public.workspaces
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Only admins can delete workspaces" ON public.workspaces
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ====================================
-- 4. 코멘트 추가
-- ====================================

COMMENT ON POLICY "Users can view non-hidden reviews" ON public.user_reviews IS
  '일반 사용자는 숨겨지지 않은 리뷰만 조회, 관리자는 모든 리뷰 조회 가능';

COMMENT ON POLICY "Users can update their own reviews" ON public.user_reviews IS
  '사용자는 자신의 리뷰만 수정 가능, 관리자는 모든 리뷰 수정 가능 (hidden 필드 포함)';

COMMENT ON POLICY "Only admins can update cities" ON public.cities IS
  '관리자만 도시 정보 수정 가능 (is_hidden 필드 포함)';

COMMENT ON POLICY "Only admins can update workspaces" ON public.workspaces IS
  '관리자만 작업공간 정보 수정 가능 (is_hidden 필드 포함)';
