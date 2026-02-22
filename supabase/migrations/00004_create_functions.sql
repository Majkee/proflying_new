-- ProFlying Academy - Database Functions

-- ============================================================
-- ensure_session: Creates a class session on-demand if not exists
-- Returns the session_id (existing or newly created)
-- ============================================================

CREATE OR REPLACE FUNCTION ensure_session(
  p_group_id UUID,
  p_date DATE
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Try to find existing session
  SELECT id INTO v_session_id
  FROM class_sessions
  WHERE group_id = p_group_id AND session_date = p_date;

  -- If not found, create one
  IF v_session_id IS NULL THEN
    INSERT INTO class_sessions (group_id, session_date)
    VALUES (p_group_id, p_date)
    ON CONFLICT (group_id, session_date) DO NOTHING
    RETURNING id INTO v_session_id;

    -- Handle race condition: if ON CONFLICT hit, re-fetch
    IF v_session_id IS NULL THEN
      SELECT id INTO v_session_id
      FROM class_sessions
      WHERE group_id = p_group_id AND session_date = p_date;
    END IF;
  END IF;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- toggle_attendance: Upserts attendance record
-- Returns the attendance record id and final status
-- ============================================================

CREATE OR REPLACE FUNCTION toggle_attendance(
  p_session_id UUID,
  p_student_id UUID,
  p_status attendance_status,
  p_note TEXT DEFAULT NULL,
  p_is_substitute BOOLEAN DEFAULT false,
  p_substitute_name TEXT DEFAULT NULL
)
RETURNS TABLE(attendance_id UUID, final_status attendance_status) AS $$
DECLARE
  v_id UUID;
  v_status attendance_status;
BEGIN
  INSERT INTO attendance (session_id, student_id, status, note, is_substitute, substitute_name, marked_by, marked_at)
  VALUES (p_session_id, p_student_id, p_status, p_note, p_is_substitute, p_substitute_name, auth.uid(), now())
  ON CONFLICT (session_id, student_id) DO UPDATE SET
    status = EXCLUDED.status,
    note = COALESCE(EXCLUDED.note, attendance.note),
    is_substitute = EXCLUDED.is_substitute,
    substitute_name = EXCLUDED.substitute_name,
    marked_by = EXCLUDED.marked_by,
    marked_at = now()
  RETURNING id, status INTO v_id, v_status;

  RETURN QUERY SELECT v_id, v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- get_group_attendance_summary: Gets attendance counts for a group on a date
-- ============================================================

CREATE OR REPLACE FUNCTION get_group_attendance_summary(
  p_group_id UUID,
  p_date DATE
)
RETURNS TABLE(
  total_members BIGINT,
  present_count BIGINT,
  absent_count BIGINT,
  excused_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM group_memberships WHERE group_id = p_group_id AND is_active = true) AS total_members,
    COALESCE(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END), 0) AS present_count,
    COALESCE(SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END), 0) AS absent_count,
    COALESCE(SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END), 0) AS excused_count
  FROM class_sessions cs
  LEFT JOIN attendance a ON a.session_id = cs.id
  WHERE cs.group_id = p_group_id AND cs.session_date = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- get_monthly_revenue: Gets revenue for a studio in a given month
-- ============================================================

CREATE OR REPLACE FUNCTION get_monthly_revenue(
  p_studio_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TABLE(
  total_amount BIGINT,
  cash_amount BIGINT,
  transfer_amount BIGINT,
  payment_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(p.amount), 0)::BIGINT AS total_amount,
    COALESCE(SUM(CASE WHEN p.method = 'cash' THEN p.amount ELSE 0 END), 0)::BIGINT AS cash_amount,
    COALESCE(SUM(CASE WHEN p.method = 'transfer' THEN p.amount ELSE 0 END), 0)::BIGINT AS transfer_amount,
    COUNT(p.id)::BIGINT AS payment_count
  FROM payments p
  WHERE p.studio_id = p_studio_id
    AND EXTRACT(YEAR FROM p.paid_at) = p_year
    AND EXTRACT(MONTH FROM p.paid_at) = p_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- get_overdue_students: Gets students with expired passes
-- ============================================================

CREATE OR REPLACE FUNCTION get_overdue_students(p_studio_id UUID)
RETURNS TABLE(
  student_id UUID,
  student_name TEXT,
  last_pass_end DATE,
  pass_type pass_type
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (s.id)
    s.id AS student_id,
    s.full_name AS student_name,
    pa.valid_until AS last_pass_end,
    pa.pass_type
  FROM students s
  JOIN group_memberships gm ON gm.student_id = s.id AND gm.is_active = true
  LEFT JOIN passes pa ON pa.student_id = s.id AND pa.is_active = true
  WHERE s.studio_id = p_studio_id
    AND s.is_active = true
    AND (pa.id IS NULL OR pa.valid_until < CURRENT_DATE)
  ORDER BY s.id, pa.valid_until DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
