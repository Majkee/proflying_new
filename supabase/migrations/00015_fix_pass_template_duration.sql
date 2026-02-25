-- Fix monthly pass template durations.
-- A 4-week pass starting on day 1 should end 3 weeks later (21 days),
-- because the first week is already week 1.
-- duration_days=22 with the formula (from + duration_days - 1) gives +21 days.

UPDATE pass_templates
SET duration_days = 22
WHERE duration_days = 30;
