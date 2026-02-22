-- ProFlying Academy - Auto-Renewal, Public Holidays, Renewal Function

-- ============================================================
-- 1. Public Holidays table
-- ============================================================

CREATE TABLE public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_public_holidays_date ON public_holidays(holiday_date);

-- RLS: everyone can read, only super_admin can modify
ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view holidays"
  ON public_holidays FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage holidays"
  ON public_holidays FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================================
-- 2. Seed Polish public holidays for 2026
-- ============================================================

INSERT INTO public_holidays (holiday_date, name) VALUES
  ('2026-01-01', 'Nowy Rok'),
  ('2026-01-06', 'Święto Trzech Króli'),
  ('2026-04-05', 'Niedziela Wielkanocna'),
  ('2026-04-06', 'Poniedziałek Wielkanocny'),
  ('2026-05-01', 'Święto Pracy'),
  ('2026-05-03', 'Święto Konstytucji 3 Maja'),
  ('2026-05-24', 'Zielone Świątki'),
  ('2026-06-04', 'Boże Ciało'),
  ('2026-08-15', 'Wniebowzięcie NMP'),
  ('2026-11-01', 'Wszystkich Świętych'),
  ('2026-11-11', 'Święto Niepodległości'),
  ('2026-12-24', 'Wigilia Bożego Narodzenia'),
  ('2026-12-25', 'Pierwszy dzień Bożego Narodzenia'),
  ('2026-12-26', 'Drugi dzień Bożego Narodzenia');

-- ============================================================
-- 3. Add auto_renew to passes
-- ============================================================

ALTER TABLE passes ADD COLUMN auto_renew BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- 4. Add auto_renew_default to pass_templates
-- ============================================================

ALTER TABLE pass_templates ADD COLUMN auto_renew_default BOOLEAN NOT NULL DEFAULT true;

-- Set single-entry templates to default false
UPDATE pass_templates SET auto_renew_default = false
  WHERE entries_total = 1 AND duration_days <= 1;

-- ============================================================
-- 5. Helper: count public holidays in a date range (inclusive)
-- ============================================================

CREATE OR REPLACE FUNCTION count_holidays_in_range(p_from DATE, p_to DATE)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public_holidays
  WHERE holiday_date BETWEEN p_from AND p_to
    AND EXTRACT(DOW FROM holiday_date) BETWEEN 1 AND 5;
    -- Only count holidays that fall on weekdays (Mon-Fri)
    -- Holidays on weekends don't affect studio schedule
$$ LANGUAGE sql STABLE;

-- ============================================================
-- 6. Helper: find next working day (skip holidays & weekends)
-- ============================================================

CREATE OR REPLACE FUNCTION next_working_day(p_date DATE)
RETURNS DATE AS $$
DECLARE
  v_date DATE := p_date;
BEGIN
  LOOP
    -- Skip weekends (0=Sunday, 6=Saturday)
    IF EXTRACT(DOW FROM v_date) IN (0, 6) THEN
      v_date := v_date + 1;
      CONTINUE;
    END IF;
    -- Skip holidays
    IF EXISTS (SELECT 1 FROM public_holidays WHERE holiday_date = v_date) THEN
      v_date := v_date + 1;
      CONTINUE;
    END IF;
    -- It's a working day
    EXIT;
  END LOOP;
  RETURN v_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 7. Renewal function: renew_expired_passes()
--    Call this daily (via pg_cron or external scheduler).
--    For each expired pass with auto_renew=true:
--    - Calculate new period (same duration)
--    - Extend valid_until by number of holidays in new period
--    - Reset entries_used to 0
-- ============================================================

CREATE OR REPLACE FUNCTION renew_expired_passes()
RETURNS TABLE(
  pass_id UUID,
  student_id UUID,
  old_valid_from DATE,
  old_valid_until DATE,
  new_valid_from DATE,
  new_valid_until DATE
) AS $$
DECLARE
  rec RECORD;
  v_duration INTEGER;
  v_new_from DATE;
  v_new_until DATE;
  v_holidays INTEGER;
  v_extended_until DATE;
BEGIN
  FOR rec IN
    SELECT p.id, p.student_id, p.valid_from, p.valid_until, p.entries_total
    FROM passes p
    WHERE p.is_active = true
      AND p.auto_renew = true
      AND p.valid_until < CURRENT_DATE
  LOOP
    -- Calculate original duration in days
    v_duration := rec.valid_until - rec.valid_from + 1;

    -- New period starts the day after old one ends
    v_new_from := rec.valid_until + 1;

    -- Skip to next working day if it falls on holiday/weekend
    v_new_from := next_working_day(v_new_from);

    -- Calculate tentative end date
    v_new_until := v_new_from + v_duration - 1;

    -- Count holidays (weekday only) within new period and extend
    v_holidays := count_holidays_in_range(v_new_from, v_new_until);

    -- Keep extending until no new holidays are introduced
    WHILE v_holidays > 0 LOOP
      v_extended_until := v_new_until + v_holidays;
      -- Check if the extension itself introduced more holidays
      v_holidays := count_holidays_in_range(v_new_until + 1, v_extended_until);
      v_new_until := v_extended_until;
    END LOOP;

    -- Update the pass with new dates and reset entries
    UPDATE passes SET
      valid_from = v_new_from,
      valid_until = v_new_until,
      entries_used = 0
    WHERE passes.id = rec.id;

    -- Return info about what was renewed
    pass_id := rec.id;
    student_id := rec.student_id;
    old_valid_from := rec.valid_from;
    old_valid_until := rec.valid_until;
    new_valid_from := v_new_from;
    new_valid_until := v_new_until;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
