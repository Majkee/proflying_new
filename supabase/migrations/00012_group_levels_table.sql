-- Create group_levels table
CREATE TABLE group_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-gray-100 text-gray-700',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed from current enum values
INSERT INTO group_levels (value, label, color, sort_order) VALUES
  ('kids',          'Kids',       'bg-blue-100 text-blue-700',    0),
  ('teens',         'Teens',      'bg-cyan-100 text-cyan-700',    1),
  ('zero',          'Zero',       'bg-green-100 text-green-700',  2),
  ('podstawa',      'Podstawa',   'bg-yellow-100 text-yellow-700',3),
  ('podstawa_plus', 'Podstawa+',  'bg-orange-100 text-orange-700',4),
  ('sredni',        'Sredni',     'bg-red-100 text-red-700',      5),
  ('exotic',        'Exotic',     'bg-pink-100 text-pink-700',    6),
  ('priv',          'Prywatne',   'bg-purple-100 text-purple-700',7);

-- Change groups.level from enum to text
ALTER TABLE groups ALTER COLUMN level TYPE TEXT USING level::TEXT;
ALTER TABLE groups ALTER COLUMN level SET DEFAULT 'podstawa';

-- Drop the old enum type
DROP TYPE group_level;

-- RLS: allow authenticated users to read levels
ALTER TABLE group_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read levels"
  ON group_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admins can manage levels"
  ON group_levels FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );
