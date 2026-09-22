-- Run this whole file in Supabase Dashboard -> SQL Editor -> New query -> Run

create table if not exists public.driver_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  full_name text not null,
  phone text not null,
  address text not null,
  id_number text not null,
  id_document_url text,
  vehicle_make text not null,
  vehicle_model text not null,
  vehicle_year text not null,
  vehicle_plate text not null,
  vehicle_registration_url text,
  drivers_license_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.driver_profiles enable row level security;

-- a driver can see and insert only their own application
create policy "drivers can view own profile"
  on public.driver_profiles for select
  using (auth.uid() = user_id);

create policy "drivers can insert own profile"
  on public.driver_profiles for insert
  with check (auth.uid() = user_id);

-- allow any signed-in user to read/update all profiles, so the /admin
-- review screen can list and approve applications (fine for a demo/test task)
create policy "signed in users can view all profiles"
  on public.driver_profiles for select
  using (auth.role() = 'authenticated');

create policy "signed in users can update status"
  on public.driver_profiles for update
  using (auth.role() = 'authenticated');

-- storage bucket for uploaded documents
insert into storage.buckets (id, name, public)
values ('driver-documents', 'driver-documents', true)
on conflict (id) do nothing;

create policy "authenticated users can upload documents"
  on storage.objects for insert
  with check (bucket_id = 'driver-documents' and auth.role() = 'authenticated');

create policy "anyone can view documents"
  on storage.objects for select
  using (bucket_id = 'driver-documents');
