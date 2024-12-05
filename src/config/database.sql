-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Disable RLS temporarily
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS nurses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS schedules DISABLE ROW LEVEL SECURITY;

-- Drop existing tables
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS nurses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'nurse')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create nurses table
CREATE TABLE public.nurses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create schedules table with proper structure
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nurse_id UUID REFERENCES nurses(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    status TEXT NOT NULL,
    notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT valid_month CHECK (month BETWEEN 1 AND 12),
    CONSTRAINT valid_day CHECK (day BETWEEN 1 AND 31),
    CONSTRAINT valid_year CHECK (year >= 2024),
    UNIQUE(nurse_id, year, month, day)
);

-- Create session management functions
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', TRUE)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.set_current_user_id(user_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create role check functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM users WHERE id = get_current_user_id();
    RETURN v_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_nurse()
RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM users WHERE id = get_current_user_id();
    RETURN v_role = 'nurse';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY users_select ON users FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY users_insert ON users FOR INSERT TO authenticated WITH CHECK (is_admin() OR get_current_user_id() IS NULL);
CREATE POLICY users_update ON users FOR UPDATE TO authenticated USING (is_admin() OR id = get_current_user_id());
CREATE POLICY users_delete ON users FOR DELETE TO authenticated USING (is_admin());

-- Create RLS policies for nurses
CREATE POLICY nurses_select ON nurses FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY nurses_insert ON nurses FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY nurses_update ON nurses FOR UPDATE TO authenticated USING (is_admin() OR user_id = get_current_user_id());
CREATE POLICY nurses_delete ON nurses FOR DELETE TO authenticated USING (is_admin());

-- Create RLS policies for schedules
CREATE POLICY schedules_select ON schedules FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY schedules_insert ON schedules FOR INSERT TO authenticated 
WITH CHECK (
    is_admin() OR 
    EXISTS (
        SELECT 1 FROM nurses 
        WHERE nurses.id = nurse_id 
        AND nurses.user_id = get_current_user_id()
    )
);
CREATE POLICY schedules_update ON schedules FOR UPDATE TO authenticated 
USING (
    is_admin() OR 
    EXISTS (
        SELECT 1 FROM nurses 
        WHERE nurses.id = nurse_id 
        AND nurses.user_id = get_current_user_id()
    )
);
CREATE POLICY schedules_delete ON schedules FOR DELETE TO authenticated 
USING (
    is_admin() OR 
    EXISTS (
        SELECT 1 FROM nurses 
        WHERE nurses.id = nurse_id 
        AND nurses.user_id = get_current_user_id()
    )
);

-- Insert default admin if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
        INSERT INTO users (username, password, role)
        VALUES ('admin', 'admin123', 'admin');
    END IF;
END $$;