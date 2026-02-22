-- Clean test data, keeping studios, public_holidays, pass_templates, profiles, studio_members
DELETE FROM attendance;
DELETE FROM class_sessions;
DELETE FROM payments;
DELETE FROM passes;
DELETE FROM group_memberships;
DELETE FROM groups;
DELETE FROM students;
DELETE FROM instructors;
