-- Allow instructors to insert payments (for cash payment recording from attendance)

DROP POLICY "Managers and admins can insert payments" ON payments;

CREATE POLICY "Authorized users can insert payments"
  ON payments FOR INSERT
  WITH CHECK (
    is_super_admin() OR (
      get_user_role() IN ('manager', 'instructor')
      AND studio_id = ANY(get_user_studio_ids())
    )
  );
