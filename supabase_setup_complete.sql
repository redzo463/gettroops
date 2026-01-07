
-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Public Profile used by Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  name text,
  role text DEFAULT 'candidate',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. ADMINS TABLE (For Dashboard Access)
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL, -- 'master' or 'staff'
  code text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins are viewable by everyone" ON public.admins FOR SELECT USING (true);
CREATE POLICY "Allow all operations for now" ON public.admins FOR ALL USING (true);

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
CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Allow all operations for now" ON public.companies FOR ALL USING (true);

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
CREATE POLICY "Applications viewable by everyone" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Allow all operations for now" ON public.applications FOR ALL USING (true);

-- 5. MASTER ADMIN INSERT
-- This grants Dashboard access to the existing Auth user 'rsbredzo@gmail.com'
INSERT INTO public.admins (email, name, role, code)
VALUES ('rsbredzo@gmail.com', 'Redzep', 'master', '26f04')
ON CONFLICT (email) DO UPDATE SET role = 'master';

-- 6. AUTOMATC USER PROFILE SYNC TRIGGER
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
