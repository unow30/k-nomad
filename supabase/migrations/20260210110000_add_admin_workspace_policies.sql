-- Admin만 작업공간 생성/수정/삭제 가능

CREATE POLICY "Admins can insert workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update workspaces"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete workspaces"
  ON workspaces FOR DELETE
  TO authenticated
  USING (public.is_admin());
