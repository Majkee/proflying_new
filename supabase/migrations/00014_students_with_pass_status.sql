-- ProFlying Academy - Students with Pass Status RPC

-- ============================================================
-- get_students_with_pass_status: Returns active students for a
-- studio with their latest active pass info and payment status.
-- Students without a pass have NULL pass columns.
-- ============================================================

CREATE OR REPLACE FUNCTION get_students_with_pass_status(p_studio_id UUID)
RETURNS TABLE(
  student_id UUID,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  pass_id UUID,
  pass_type pass_type,
  template_name TEXT,
  valid_from DATE,
  valid_until DATE,
  auto_renew BOOLEAN,
  price_amount INTEGER,
  is_paid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS student_id,
    s.full_name,
    s.phone,
    s.email,
    lp.id AS pass_id,
    lp.pass_type,
    pt.name AS template_name,
    lp.valid_from,
    lp.valid_until,
    lp.auto_renew,
    lp.price_amount,
    CASE
      WHEN lp.id IS NULL THEN NULL::BOOLEAN
      ELSE EXISTS (
        SELECT 1 FROM payments pay
        WHERE pay.pass_id = lp.id
          AND pay.paid_at >= lp.valid_from::timestamptz
      )
    END AS is_paid
  FROM students s
  LEFT JOIN LATERAL (
    SELECT p.*
    FROM passes p
    WHERE p.student_id = s.id
      AND p.is_active = true
    ORDER BY p.valid_until DESC
    LIMIT 1
  ) lp ON true
  LEFT JOIN pass_templates pt ON pt.id = lp.template_id
  WHERE s.studio_id = p_studio_id
    AND s.is_active = true
  ORDER BY s.full_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
