
-- THIS SCRIPT IS SAFE TO RUN MULTIPLE TIMES
-- It checks if policies exist before creating them

-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  name text,
  role text DEFAULT 'candidate',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Public users are viewable by everyone') THEN
        CREATE POLICY "Public users are viewable by everyone" ON public.users FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- 2. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL, 
  code text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Admins are viewable by everyone') THEN
        CREATE POLICY "Admins are viewable by everyone" ON public.admins FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Allow all operations for now') THEN
        CREATE POLICY "Allow all operations for now" ON public.admins FOR ALL USING (true);
    END IF;
END $$;

-- 3. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  address text,
  contact_person text,
  phone text,
  email text,
  positions text,
  worker_count integer,
  salary_range text,
  status text DEFAULT 'Active',
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Companies are viewable by everyone') THEN
        CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Allow all operations for now') THEN
        CREATE POLICY "Allow all operations for now" ON public.companies FOR ALL USING (true);
    END IF;
END $$;

-- 4. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  position text NOT NULL,
  experience text,
  about text,
  cv_file text,
  cv_name text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'Applications viewable by everyone') THEN
        CREATE POLICY "Applications viewable by everyone" ON public.applications FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'Allow all operations for now') THEN
        CREATE POLICY "Allow all operations for now" ON public.applications FOR ALL USING (true);
    END IF;
END $$;

-- 5. MASTER ADMIN INSERT (Idempotent)
INSERT INTO public.admins (email, name, role, code)
VALUES ('rsbredzo@gmail.com', 'Redzep', 'master', '26f04')
ON CONFLICT (email) DO UPDATE SET role = 'master';

-- 6. TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'candidate', now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
