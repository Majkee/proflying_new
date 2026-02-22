-- Allow managers to manage public holidays (not just super_admin)

DROP POLICY IF EXISTS "Super admins can manage holidays" ON public_holidays;

CREATE POLICY "Managers and admins can manage holidays"
  ON public_holidays FOR ALL
  USING (is_super_admin() OR get_user_role() = 'manager')
  WITH CHECK (is_super_admin() OR get_user_role() = 'manager');
