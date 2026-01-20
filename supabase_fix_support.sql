-- Create support_messages table
create table if not exists public.support_messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text,
  email text,
  subject text,
  message text,
  status text default 'new' check (status in ('new', 'read', 'resolved'))
);

-- Enable RLS
alter table public.support_messages enable row level security;

-- Policies
-- 1. Everyone can insert (Contact Form usage)
drop policy if exists "Enable insert for all users" on public.support_messages;
create policy "Enable insert for all users"
on public.support_messages for insert
with check ( true );

-- 2. Only authenticated users (Admins) can select/read
-- (Or strictly master admin if preferred, but 'authenticated' is a good baseline)
drop policy if exists "Enable read access for authenticated users" on public.support_messages;
create policy "Enable read access for authenticated users"
on public.support_messages for select
using ( auth.role() = 'authenticated' );

-- 3. Only authenticated users can update (e.g. marking as resolved)
drop policy if exists "Enable update for authenticated users" on public.support_messages;
create policy "Enable update for authenticated users"
on public.support_messages for update
using ( auth.role() = 'authenticated' );

-- 4. Only authenticated users can delete
drop policy if exists "Enable delete for authenticated users" on public.support_messages;
create policy "Enable delete for authenticated users"
on public.support_messages for delete
using ( auth.role() = 'authenticated' );
