-- ProFlying Academy - Seed Data
-- Run this after setting up auth users manually in Supabase dashboard

-- Create two studios
INSERT INTO studios (id, name, address, phone) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'ProFlying Studio Centrum', 'ul. Marszalkowska 10, Warszawa', '+48 500 100 200'),
  ('a0000000-0000-0000-0000-000000000002', 'ProFlying Studio Mokotow', 'ul. Pulawska 45, Warszawa', '+48 500 100 300');

-- NOTE: Profiles are auto-created via trigger when auth users are created.
-- To seed test users:
-- 1. Create users in Supabase Auth dashboard (or via API)
-- 2. Update their profiles with correct roles:
--
-- UPDATE profiles SET role = 'super_admin', full_name = 'Admin ProFlying'
--   WHERE id = '<super_admin_user_uuid>';
--
-- UPDATE profiles SET role = 'manager', full_name = 'Manager Centrum',
--   default_studio_id = 'a0000000-0000-0000-0000-000000000001'
--   WHERE id = '<manager_user_uuid>';
--
-- INSERT INTO studio_members (profile_id, studio_id, role) VALUES
--   ('<manager_user_uuid>', 'a0000000-0000-0000-0000-000000000001', 'manager');
--
-- INSERT INTO studio_members (profile_id, studio_id, role) VALUES
--   ('<instructor_user_uuid>', 'a0000000-0000-0000-0000-000000000001', 'instructor');

-- Sample instructors (without login accounts)
INSERT INTO instructors (id, studio_id, full_name, phone, email) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Anna Kowalska', '+48 600 111 222', 'anna@proflying.pl'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Marta Nowak', '+48 600 333 444', 'marta@proflying.pl'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Karolina Wisniewski', '+48 600 555 666', 'karolina@proflying.pl'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Anna Kowalska', '+48 600 111 222', 'anna@proflying.pl');
  -- Anna is shared across both studios (2 instructor records, could link to same profile_id)

-- Sample groups for Studio Centrum
INSERT INTO groups (studio_id, code, name, day_of_week, start_time, end_time, level, instructor_id, capacity) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'PO1', 'Podstawa Poniedzialek', 1, '17:00', '18:00', 'podstawa', 'b0000000-0000-0000-0000-000000000001', 10),
  ('a0000000-0000-0000-0000-000000000001', 'PO2', 'Sredni Poniedzialek', 1, '18:15', '19:15', 'sredni', 'b0000000-0000-0000-0000-000000000001', 8),
  ('a0000000-0000-0000-0000-000000000001', 'WT1', 'Zero Wtorek', 2, '17:00', '18:00', 'zero', 'b0000000-0000-0000-0000-000000000002', 12),
  ('a0000000-0000-0000-0000-000000000001', 'WT2', 'Podstawa+ Wtorek', 2, '18:15', '19:15', 'podstawa_plus', 'b0000000-0000-0000-0000-000000000002', 10),
  ('a0000000-0000-0000-0000-000000000001', 'SR1', 'Kids Sroda', 3, '16:00', '17:00', 'kids', 'b0000000-0000-0000-0000-000000000001', 10),
  ('a0000000-0000-0000-0000-000000000001', 'SR2', 'Exotic Sroda', 3, '18:00', '19:00', 'exotic', 'b0000000-0000-0000-0000-000000000002', 8),
  ('a0000000-0000-0000-0000-000000000001', 'CZ1', 'Podstawa Czwartek', 4, '17:00', '18:00', 'podstawa', 'b0000000-0000-0000-0000-000000000001', 10),
  ('a0000000-0000-0000-0000-000000000001', 'PT1', 'Teens Piatek', 5, '16:00', '17:00', 'teens', 'b0000000-0000-0000-0000-000000000002', 12),
  ('a0000000-0000-0000-0000-000000000001', 'SO1', 'Open Practice Sobota', 6, '10:00', '11:30', 'podstawa', 'b0000000-0000-0000-0000-000000000001', 15);

-- Sample groups for Studio Mokotow
INSERT INTO groups (studio_id, code, name, day_of_week, start_time, end_time, level, instructor_id, capacity) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'PO1', 'Zero Poniedzialek', 1, '18:00', '19:00', 'zero', 'b0000000-0000-0000-0000-000000000003', 10),
  ('a0000000-0000-0000-0000-000000000002', 'SR1', 'Podstawa Sroda', 3, '18:00', '19:00', 'podstawa', 'b0000000-0000-0000-0000-000000000004', 10),
  ('a0000000-0000-0000-0000-000000000002', 'PT1', 'Sredni Piatek', 5, '18:00', '19:00', 'sredni', 'b0000000-0000-0000-0000-000000000003', 8);

-- Sample students for Studio Centrum
INSERT INTO students (id, studio_id, full_name, phone, email) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Zuzanna Lewandowska', '+48 700 001 001', 'zuzanna@email.pl'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Maja Kaminska', '+48 700 001 002', 'maja@email.pl'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Lena Zielinska', '+48 700 001 003', NULL),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Hanna Szymanska', '+48 700 001 004', 'hanna@email.pl'),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Alicja Wozniak', NULL, 'alicja@email.pl'),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Julia Dabrowski', '+48 700 001 006', NULL),
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Oliwia Kozlowska', '+48 700 001 007', 'oliwia@email.pl');

-- Sample students for Studio Mokotow
INSERT INTO students (id, studio_id, full_name, phone) VALUES
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'Emilia Jankowska', '+48 700 002 001'),
  ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', 'Amelia Wojciechowska', '+48 700 002 002'),
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 'Natalia Kwiatkowska', '+48 700 002 003');

-- Enroll students in groups (Centrum)
INSERT INTO group_memberships (student_id, group_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', (SELECT id FROM groups WHERE code = 'PO1' AND studio_id = 'a0000000-0000-0000-0000-000000000001')),
  ('c0000000-0000-0000-0000-000000000002', (SELECT id FROM groups WHERE code = 'PO1' AND studio_id = 'a0000000-0000-0000-0000-000000000001')),
  ('c0000000-0000-0000-0000-000000000003', (SELECT id FROM groups WHERE code = 'PO1' AND studio_id = 'a0000000-0000-0000-0000-000000000001')),
  ('c0000000-0000-0000-0000-000000000004', (SELECT id FROM groups WHERE code = 'PO2' AND studio_id = 'a0000000-0000-0000-0000-000000000001')),
  ('c0000000-0000-0000-0000-000000000005', (SELECT id FROM groups WHERE code = 'PO2' AND studio_id = 'a0000000-0000-0000-0000-000000000001')),
  ('c0000000-0000-0000-0000-000000000001', (SELECT id FROM groups WHERE code = 'WT1' AND studio_id = 'a0000000-0000-0000-0000-000000000001')),
  ('c0000000-0000-0000-0000-000000000006', (SELECT id FROM groups WHERE code = 'WT1' AND studio_id = 'a0000000-0000-0000-0000-000000000001')),
  ('c0000000-0000-0000-0000-000000000007', (SELECT id FROM groups WHERE code = 'SR1' AND studio_id = 'a0000000-0000-0000-0000-000000000001'));

-- Enroll students in groups (Mokotow)
INSERT INTO group_memberships (student_id, group_id) VALUES
  ('c0000000-0000-0000-0000-000000000008', (SELECT id FROM groups WHERE code = 'PO1' AND studio_id = 'a0000000-0000-0000-0000-000000000002')),
  ('c0000000-0000-0000-0000-000000000009', (SELECT id FROM groups WHERE code = 'PO1' AND studio_id = 'a0000000-0000-0000-0000-000000000002')),
  ('c0000000-0000-0000-0000-000000000010', (SELECT id FROM groups WHERE code = 'SR1' AND studio_id = 'a0000000-0000-0000-0000-000000000002'));

-- Sample passes
INSERT INTO passes (studio_id, student_id, pass_type, price_amount, valid_from, valid_until, entries_total) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'monthly_2x', 250, '2026-02-01', '2026-02-28', 8),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'monthly_1x', 160, '2026-02-01', '2026-02-28', 4),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'monthly_1x', 160, '2026-01-01', '2026-01-31', 4),  -- expired
  ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000008', 'monthly_1x', 160, '2026-02-01', '2026-02-28', 4);

-- Sample payments
INSERT INTO payments (studio_id, student_id, pass_id, amount, method) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', (SELECT id FROM passes WHERE student_id = 'c0000000-0000-0000-0000-000000000001' LIMIT 1), 250, 'transfer'),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', (SELECT id FROM passes WHERE student_id = 'c0000000-0000-0000-0000-000000000002' LIMIT 1), 160, 'cash'),
  ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000008', (SELECT id FROM passes WHERE student_id = 'c0000000-0000-0000-0000-000000000008' LIMIT 1), 160, 'transfer');
