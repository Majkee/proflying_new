-- ProFlying Academy - Unpaid Passes RPC

-- ============================================================
-- get_unpaid_passes: Returns active passes with no payment
-- for the current period (paid_at >= valid_from).
-- Catches both new unpaid passes and auto-renewed passes
-- where valid_from shifted past the last payment date.
-- ============================================================

CREATE OR REPLACE FUNCTION get_unpaid_passes(p_studio_id UUID)
RETURNS TABLE(
  pass_id UUID,
  student_id UUID,
  student_name TEXT,
  pass_type pass_type,
  template_name TEXT,
  valid_from DATE,
  valid_until DATE,
  price_amount INTEGER,
  auto_renew BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS pass_id,
    p.student_id,
    s.full_name AS student_name,
    p.pass_type,
    pt.name AS template_name,
    p.valid_from,
    p.valid_until,
    p.price_amount,
    p.auto_renew
  FROM passes p
  JOIN students s ON s.id = p.student_id
  LEFT JOIN pass_templates pt ON pt.id = p.template_id
  LEFT JOIN payments pay ON pay.pass_id = p.id AND pay.paid_at >= p.valid_from::timestamptz
  WHERE p.studio_id = p_studio_id
    AND p.is_active = true
    AND pay.id IS NULL
  ORDER BY p.valid_from ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
