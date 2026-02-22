-- ProFlying Academy - Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper functions for RLS
-- ============================================================

-- Check if user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get user's global role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles
  WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get array of studio_ids user can access
CREATE OR REPLACE FUNCTION get_user_studio_ids()
RETURNS UUID[] AS $$
  SELECT CASE
    WHEN is_super_admin() THEN
      ARRAY(SELECT id FROM studios WHERE is_active = true)
    ELSE
      ARRAY(SELECT studio_id FROM studio_members WHERE profile_id = auth.uid())
  END;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get instructor record IDs linked to the user's profile
CREATE OR REPLACE FUNCTION get_user_instructor_ids()
RETURNS UUID[] AS $$
  SELECT COALESCE(
    ARRAY(SELECT id FROM instructors WHERE profile_id = auth.uid() AND is_active = true),
    '{}'::UUID[]
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Studios policies
-- ============================================================

CREATE POLICY "Users can view studios they belong to"
  ON studios FOR SELECT
  USING (is_super_admin() OR id = ANY(get_user_studio_ids()));

CREATE POLICY "Super admins can insert studios"
  ON studios FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can update studios"
  ON studios FOR UPDATE
  USING (is_super_admin());

-- ============================================================
-- Profiles policies
-- ============================================================

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_super_admin());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid() OR is_super_admin());

CREATE POLICY "Super admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (is_super_admin() OR id = auth.uid());

-- ============================================================
-- Studio Members policies
-- ============================================================

CREATE POLICY "Users can view studio members of their studios"
  ON studio_members FOR SELECT
  USING (is_super_admin() OR studio_id = ANY(get_user_studio_ids()));

CREATE POLICY "Super admins can manage studio members"
  ON studio_members FOR INSERT
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can update studio members"
  ON studio_members FOR UPDATE
  USING (is_super_admin());

CREATE POLICY "Super admins can delete studio members"
  ON studio_members FOR DELETE
  USING (is_super_admin());

-- ============================================================
-- Instructors policies
-- ============================================================

CREATE POLICY "Users can view instructors in their studios"
  ON instructors FOR SELECT
  USING (is_super_admin() OR studio_id = ANY(get_user_studio_ids()));

CREATE POLICY "Managers and admins can insert instructors"
  ON instructors FOR INSERT
  WITH CHECK (
    is_super_admin() OR (
      get_user_role() = 'manager' AND studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Managers and admins can update instructors"
  ON instructors FOR UPDATE
  USING (
    is_super_admin() OR (
      get_user_role() = 'manager' AND studio_id = ANY(get_user_studio_ids())
    )
  );

-- ============================================================
-- Groups policies
-- ============================================================

CREATE POLICY "Users can view groups in their studios"
  ON groups FOR SELECT
  USING (is_super_admin() OR studio_id = ANY(get_user_studio_ids()));

CREATE POLICY "Managers and admins can insert groups"
  ON groups FOR INSERT
  WITH CHECK (
    is_super_admin() OR (
      get_user_role() = 'manager' AND studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Managers and admins can update groups"
  ON groups FOR UPDATE
  USING (
    is_super_admin() OR (
      get_user_role() = 'manager' AND studio_id = ANY(get_user_studio_ids())
    )
  );

-- ============================================================
-- Students policies
-- ============================================================

CREATE POLICY "Users can view students in their studios"
  ON students FOR SELECT
  USING (is_super_admin() OR studio_id = ANY(get_user_studio_ids()));

CREATE POLICY "Managers and admins can insert students"
  ON students FOR INSERT
  WITH CHECK (
    is_super_admin() OR (
      get_user_role() IN ('manager', 'instructor') AND studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Managers and admins can update students"
  ON students FOR UPDATE
  USING (
    is_super_admin() OR (
      get_user_role() IN ('manager', 'instructor') AND studio_id = ANY(get_user_studio_ids())
    )
  );

-- ============================================================
-- Group Memberships policies
-- ============================================================

CREATE POLICY "Users can view memberships in their studios"
  ON group_memberships FOR SELECT
  USING (
    is_super_admin() OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_memberships.group_id
      AND g.studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Managers and instructors can manage memberships"
  ON group_memberships FOR INSERT
  WITH CHECK (
    is_super_admin() OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_memberships.group_id
      AND g.studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Managers and instructors can update memberships"
  ON group_memberships FOR UPDATE
  USING (
    is_super_admin() OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_memberships.group_id
      AND g.studio_id = ANY(get_user_studio_ids())
    )
  );

-- ============================================================
-- Class Sessions policies
-- ============================================================

CREATE POLICY "Users can view sessions in their studios"
  ON class_sessions FOR SELECT
  USING (
    is_super_admin() OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = class_sessions.group_id
      AND g.studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Users can insert sessions in their studios"
  ON class_sessions FOR INSERT
  WITH CHECK (
    is_super_admin() OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = class_sessions.group_id
      AND g.studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Users can update sessions in their studios"
  ON class_sessions FOR UPDATE
  USING (
    is_super_admin() OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = class_sessions.group_id
      AND g.studio_id = ANY(get_user_studio_ids())
    )
  );

-- ============================================================
-- Attendance policies
-- ============================================================

CREATE POLICY "Users can view attendance in their studios"
  ON attendance FOR SELECT
  USING (
    is_super_admin() OR EXISTS (
      SELECT 1 FROM class_sessions cs
      JOIN groups g ON g.id = cs.group_id
      WHERE cs.id = attendance.session_id
      AND g.studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Users can insert attendance in their studios"
  ON attendance FOR INSERT
  WITH CHECK (
    is_super_admin() OR EXISTS (
      SELECT 1 FROM class_sessions cs
      JOIN groups g ON g.id = cs.group_id
      WHERE cs.id = attendance.session_id
      AND g.studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Users can update attendance in their studios"
  ON attendance FOR UPDATE
  USING (
    is_super_admin() OR EXISTS (
      SELECT 1 FROM class_sessions cs
      JOIN groups g ON g.id = cs.group_id
      WHERE cs.id = attendance.session_id
      AND g.studio_id = ANY(get_user_studio_ids())
    )
  );

-- ============================================================
-- Passes policies
-- ============================================================

CREATE POLICY "Managers and admins can view passes"
  ON passes FOR SELECT
  USING (
    is_super_admin() OR (
      get_user_role() IN ('manager', 'instructor') AND studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Managers and admins can insert passes"
  ON passes FOR INSERT
  WITH CHECK (
    is_super_admin() OR (
      get_user_role() = 'manager' AND studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Managers and admins can update passes"
  ON passes FOR UPDATE
  USING (
    is_super_admin() OR (
      get_user_role() = 'manager' AND studio_id = ANY(get_user_studio_ids())
    )
  );

-- ============================================================
-- Payments policies (manager+ only)
-- ============================================================

CREATE POLICY "Managers and admins can view payments"
  ON payments FOR SELECT
  USING (
    is_super_admin() OR (
      get_user_role() = 'manager' AND studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Managers and admins can insert payments"
  ON payments FOR INSERT
  WITH CHECK (
    is_super_admin() OR (
      get_user_role() = 'manager' AND studio_id = ANY(get_user_studio_ids())
    )
  );

CREATE POLICY "Managers and admins can update payments"
  ON payments FOR UPDATE
  USING (
    is_super_admin() OR (
      get_user_role() = 'manager' AND studio_id = ANY(get_user_studio_ids())
    )
  );

-- ============================================================
-- Auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'instructor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
