-- ProFlying Academy - Pass Templates & Required Pass-Payment Link

-- ============================================================
-- 1. Create pass_templates table
-- ============================================================

CREATE TABLE pass_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  entries_total INTEGER,
  default_price INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(studio_id, name)
);

CREATE INDEX idx_pass_templates_studio ON pass_templates(studio_id);

-- ============================================================
-- 2. RLS for pass_templates
-- ============================================================

ALTER TABLE pass_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pass templates in their studios"
  ON pass_templates FOR SELECT
  USING (
    is_super_admin() OR (
      get_user_role() IN ('manager', 'instructor') AND studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Managers and admins can insert pass templates"
  ON pass_templates FOR INSERT
  WITH CHECK (
    is_super_admin() OR (
      get_user_role() = 'manager' AND studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Managers and admins can update pass templates"
  ON pass_templates FOR UPDATE
  USING (
    is_super_admin() OR (
      get_user_role() = 'manager' AND studio_id = ANY(get_user_studio_ids())
    )
  );

-- ============================================================
-- 3. Seed default templates for both studios
-- ============================================================

INSERT INTO pass_templates (studio_id, name, duration_days, entries_total, default_price, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Jednorazowe', 1, 1, 40, 0),
  ('a0000000-0000-0000-0000-000000000001', 'Miesięczny 1x/tyg', 30, 4, 160, 1),
  ('a0000000-0000-0000-0000-000000000001', 'Miesięczny 2x/tyg', 30, 8, 250, 2),
  ('a0000000-0000-0000-0000-000000000002', 'Jednorazowe', 1, 1, 40, 0),
  ('a0000000-0000-0000-0000-000000000002', 'Miesięczny 1x/tyg', 30, 4, 160, 1),
  ('a0000000-0000-0000-0000-000000000002', 'Miesięczny 2x/tyg', 30, 8, 250, 2);

-- ============================================================
-- 4. Add template_id column to passes
-- ============================================================

ALTER TABLE passes ADD COLUMN template_id UUID REFERENCES pass_templates(id) ON DELETE SET NULL;

-- ============================================================
-- 5. Make pass_id NOT NULL on payments
-- ============================================================

-- Delete any orphan payments without a pass (shouldn't exist in practice)
DELETE FROM payments WHERE pass_id IS NULL;

-- Drop the existing FK constraint and add a new one with RESTRICT
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_pass_id_fkey;
ALTER TABLE payments ALTER COLUMN pass_id SET NOT NULL;
ALTER TABLE payments ADD CONSTRAINT payments_pass_id_fkey
  FOREIGN KEY (pass_id) REFERENCES passes(id) ON DELETE RESTRICT;
