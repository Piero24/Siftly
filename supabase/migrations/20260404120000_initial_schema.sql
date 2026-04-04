-- ═══════════════════════════════════════════════════════
-- Siftly — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up tables & RLS.
-- ═══════════════════════════════════════════════════════

-- ── Profiles (Sync from Auth) ────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique,
  full_name       text,
  avatar_url      text,
  is_active       boolean not null default true,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id and deleted_at is null);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id and deleted_at is null);

-- ── Job Applications ─────────────────────────────────
create table if not exists public.job_applications (
  id              text primary key,
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,

  company         text not null default '',
  logo            text,
  sector          text not null default '',
  position        text not null default '',
  employment_type text,  -- 'permanent' | 'intern' | 'fixed-term'
  country         text not null default '',
  city            text not null default '',
  work_type       text not null default 'remote',  -- 'onsite' | 'hybrid' | 'remote'
  cv_profile_id   text,
  status          text not null default 'pending',

  salary_amount   numeric not null default 0,
  salary_currency text not null default 'USD',

  date            text not null default '',

  link_job        text not null default '',
  link_linkedin   text not null default '',
  link_website    text not null default '',

  description     text,
  rating          numeric,

  referral_referrer text,
  referral_date     text,
  referral_note     text,
  referral_link     text,
  referral_code     text,

  recruiter_name    text,
  recruiter_email   text,
  recruiter_phone   text,

  notes           text,
  phone_screens   integer,
  interviews      integer,
  rounds          jsonb,  -- InterviewRound[]

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index for fast per-user queries
create index if not exists idx_job_applications_user_id
  on public.job_applications(user_id);

-- ── Row-Level Security ───────────────────────────────
alter table public.job_applications enable row level security;

-- Users can only see their own rows if their PROFILE is active
create policy "Users can view own applications"
  on public.job_applications for select
  using (
    auth.uid() = user_id 
    and exists (select 1 from public.profiles where id = auth.uid() and deleted_at is null)
  );

create policy "Users can insert own applications"
  on public.job_applications for insert
  with check (
    auth.uid() = user_id 
    and exists (select 1 from public.profiles where id = auth.uid() and deleted_at is null)
  );

create policy "Users can update own applications"
  on public.job_applications for update
  using (
    auth.uid() = user_id 
    and exists (select 1 from public.profiles where id = auth.uid() and deleted_at is null)
  );

create policy "Users can delete own applications"
  on public.job_applications for delete
  using (auth.uid() = user_id);

-- ── User Settings ────────────────────────────────────
create table if not exists public.user_settings (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  language            text not null default 'en',
  currency            text not null default 'USD',
  theme               text not null default 'system',
  auto_no_response    boolean not null default false,
  auto_no_response_days integer not null default 60,
  default_time_range  text not null default 'total',
  storage_mode        text not null default 'remote',
  cv_profiles         jsonb not null default '[]',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "Users can view own settings"
  on public.user_settings for select 
  using (
    auth.uid() = user_id 
    and exists (select 1 from public.profiles where id = auth.uid() and deleted_at is null)
  );

create policy "Users can insert own settings"
  on public.user_settings for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update 
  using (
    auth.uid() = user_id 
    and exists (select 1 from public.profiles where id = auth.uid() and deleted_at is null)
  );

-- ── Auth to Profile Sync Trigger ─────────────────────
-- Automatically creates/updates a profile row when a user signs in.
-- If the existing profile was deleted, this fresh login creates 
-- a "Ghost" of the old data by moving it to a backup ID.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  old_profile_id uuid;
begin
  -- 1. Check if a DELETED profile already exists for this ID
  select id into old_profile_id 
  from public.profiles 
  where id = new.id and deleted_at is not null;

  -- 2. If it does, "Ghost" the old data by changing its user_id to a random UUID
  -- This detaches it from the user's active session forever.
  if old_profile_id is not null then
    update public.job_applications 
    set user_id = gen_random_uuid() -- Orphan the data
    where user_id = new.id;
    
    update public.user_settings 
    set user_id = gen_random_uuid() -- Orphan the settings
    where user_id = new.id;

    -- Delete the old soft-deleted profile row to make room for a fresh one
    delete from public.profiles where id = new.id;
  end if;

  -- 3. Create a brand new fresh profile row
  insert into public.profiles (id, email, full_name, avatar_url, is_active, deleted_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    true,
    null
  );
  
  return new;
end;
$$;

-- Trigger on auth.users (requires manual setup in Supabase SQL editor if not already there)
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert or update on auth.users
--   for each row execute procedure public.handle_new_user();

-- ── Account Deletion RPC (Ghosting) ──────────────────
-- Simply marks the profile as deleted.
-- Because all RLS policies now check 'exists (profiles where deleted_at is null)',
-- everything linked to this ID instantly vanishes from the user's view.
create or replace function public.soft_delete_account()
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set 
    is_active = false,
    deleted_at = now()
  where id = auth.uid();
end;
$$;

-- Keep the old one for compatibility if needed, or remove it
-- drop function if exists public.delete_user_data();
