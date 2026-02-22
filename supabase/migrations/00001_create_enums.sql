-- ProFlying Academy - Enum Types

CREATE TYPE user_role AS ENUM ('super_admin', 'manager', 'instructor');
CREATE TYPE studio_role AS ENUM ('manager', 'instructor');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused');
CREATE TYPE pass_type AS ENUM ('single_entry', 'monthly_1x', 'monthly_2x', 'custom');
CREATE TYPE payment_method AS ENUM ('cash', 'transfer');
CREATE TYPE group_level AS ENUM ('kids', 'teens', 'zero', 'podstawa', 'podstawa_plus', 'sredni', 'exotic', 'priv');
