-- Reset database structure
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.nurses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create tables with the adapted structure
-- 'users' table now uses 'username' as the primary key (no UUID id)
CREATE TABLE public.users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'nurse')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 'nurses' now references 'users(username)' instead of an ID
CREATE TABLE public.nurses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_username TEXT REFERENCES public.users(username) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nurse_id UUID REFERENCES public.nurses(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    status TEXT NOT NULL,
    notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(nurse_id, year, month, day)
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access" ON public.users;
DROP POLICY IF EXISTS "Allow insert access" ON public.users;
DROP POLICY IF EXISTS "Allow update access" ON public.users;
DROP POLICY IF EXISTS "Allow delete access" ON public.users;

-- Create policies for users table
CREATE POLICY "Allow read access" ON public.users
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Allow insert access" ON public.users
    FOR INSERT TO public
    WITH CHECK (
        -- Allow inserts if no users exist (first user) or if current user is admin
        NOT EXISTS (SELECT 1 FROM public.users)
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE username = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Allow update access" ON public.users
    FOR UPDATE TO public
    USING (
        -- Allow admin to update any user, or users can update their own record
        EXISTS (
            SELECT 1 FROM public.users
            WHERE username = auth.uid() 
            AND (role = 'admin' OR username = users.username)
        )
    );

CREATE POLICY "Allow delete access" ON public.users
    FOR DELETE TO public
    USING (
        -- Only admin can delete users
        EXISTS (
            SELECT 1 FROM public.users
            WHERE username = auth.uid() 
            AND role = 'admin'
        )
    );

-- Drop existing policies for nurses
DROP POLICY IF EXISTS "Allow read access" ON public.nurses;
DROP POLICY IF EXISTS "Allow insert access" ON public.nurses;
DROP POLICY IF EXISTS "Allow update access" ON public.nurses;
DROP POLICY IF EXISTS "Allow delete access" ON public.nurses;

-- Create policies for nurses table
CREATE POLICY "Allow read access" ON public.nurses
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Allow insert access" ON public.nurses
    FOR INSERT TO public
    WITH CHECK (
        -- Only admin can create nurses
        EXISTS (
            SELECT 1 FROM public.users
            WHERE username = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Allow update access" ON public.nurses
    FOR UPDATE TO public
    USING (
        -- Admin can update any nurse, nurses can update their own record
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.username = auth.uid()
            AND (
                u.role = 'admin' 
                OR u.username = (
                    SELECT user_username FROM public.nurses n WHERE n.id = nurses.id
                )
            )
        )
    );

CREATE POLICY "Allow delete access" ON public.nurses
    FOR DELETE TO public
    USING (
        -- Only admin can delete nurses
        EXISTS (
            SELECT 1 FROM public.users
            WHERE username = auth.uid() 
            AND role = 'admin'
        )
    );

-- Drop existing policies for schedules
DROP POLICY IF EXISTS "Allow read access" ON public.schedules;
DROP POLICY IF EXISTS "Allow write access" ON public.schedules;

-- Create policies for schedules table
CREATE POLICY "Allow read access" ON public.schedules
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Allow write access" ON public.schedules
    FOR ALL TO public
    USING (
        -- Admin can modify any schedule,
        -- Nurses can only modify schedules corresponding to their own nurse record
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.nurses n ON n.user_username = u.username
            WHERE u.username = auth.uid()
            AND (
                u.role = 'admin'
                OR n.id = schedules.nurse_id
            )
        )
    );

-- Create helper functions
CREATE OR REPLACE FUNCTION public.check_password(
    p_username TEXT,
    p_password TEXT
) RETURNS public.users AS $$
DECLARE
    v_user public.users;
BEGIN
    SELECT * INTO v_user
    FROM public.users
    WHERE username = p_username
      AND password = p_password;
    
    RETURN v_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'admin') THEN
        INSERT INTO public.users (username, password, role)
        VALUES ('admin', 'admin123', 'admin');
    END IF;
END $$;
