-- ============================================================================
-- Siftly - Full Supabase Schema (Reset Baseline)
--
-- This migration consolidates the previous incremental migrations into a
-- single baseline for clean database resets.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Profiles
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  email text unique,
  full_name text,
  avatar_url text,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id and deleted_at is null);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id and deleted_at is null);

-- ----------------------------------------------------------------------------
-- Job Applications
-- ----------------------------------------------------------------------------
create table if not exists public.job_applications (
  id text primary key,
  user_id uuid not null default auth.uid(),

  company text not null default '',
  logo text,
  sector text not null default '',
  position text not null default '',
  employment_type text,
  country text not null default '',
  city text not null default '',
  work_type text not null default 'remote',
  cv_profile_id text,
  status text not null default 'pending',

  salary_amount numeric not null default 0,
  salary_currency text not null default 'USD',

  date text not null default '',

  link_job text not null default '',
  link_linkedin text not null default '',
  link_website text not null default '',

  description text,
  rating numeric,

  referral_referrer text,
  referral_date text,
  referral_note text,
  referral_link text,
  referral_code text,

  recruiter_name text,
  recruiter_email text,
  recruiter_phone text,

  notes text,
  phone_screens integer,
  interviews integer,
  rounds jsonb,

  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_job_applications_user_id
  on public.job_applications(user_id);

create index if not exists idx_job_applications_active
  on public.job_applications(user_id, deleted_at)
  where deleted_at is null;

alter table public.job_applications enable row level security;

drop policy if exists "Users can view own applications" on public.job_applications;
create policy "Users can view own applications"
  on public.job_applications for select
  using (
    auth.uid() = user_id
    and deleted_at is null
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and deleted_at is null
    )
  );

drop policy if exists "Users can insert own applications" on public.job_applications;
create policy "Users can insert own applications"
  on public.job_applications for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and deleted_at is null
    )
  );

drop policy if exists "Users can update own applications" on public.job_applications;
create policy "Users can update own applications"
  on public.job_applications for update
  using (
    auth.uid() = user_id
    and deleted_at is null
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and deleted_at is null
    )
  );

drop policy if exists "Users can delete own applications" on public.job_applications;

-- ----------------------------------------------------------------------------
-- User Settings
-- ----------------------------------------------------------------------------
create table if not exists public.user_settings (
  user_id uuid primary key,
  language text not null default 'en',
  currency text not null default 'USD',
  theme text not null default 'system',
  auto_no_response boolean not null default false,
  auto_no_response_days integer not null default 60,
  default_time_range text not null default 'total',
  default_overview_scope text not null default 'total',
  storage_mode text not null default 'remote',
  cv_profiles jsonb not null default '[]',
  notifications jsonb not null default '{"email": false}'::jsonb,
  privacy jsonb not null default '{"telemetry": true, "dataRetention": 0}'::jsonb,
  table_display jsonb not null default '{"visibleColumns": ["company", "position", "status", "date"], "defaultSort": "date-desc", "rowsPerPage": 20}'::jsonb,
  use_soft_icon_background boolean not null default true,
  is_draggable boolean not null default true,
  auto_close_enabled boolean not null default true,
  auto_close_timer integer not null default 5,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "Users can view own settings" on public.user_settings;
create policy "Users can view own settings"
  on public.user_settings for select
  using (
    auth.uid() = user_id
    and deleted_at is null
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and deleted_at is null
    )
  );

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
  on public.user_settings for update
  using (
    auth.uid() = user_id
    and deleted_at is null
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and deleted_at is null
    )
  );

-- ----------------------------------------------------------------------------
-- Functions
-- ----------------------------------------------------------------------------
create or replace function public.soft_delete_application(app_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.job_applications
  set deleted_at = now(), updated_at = now()
  where id = app_id
    and user_id = auth.uid()
    and deleted_at is null;
end;
$$;

create or replace function public.soft_delete_all_applications()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.job_applications
  set deleted_at = now(), updated_at = now()
  where user_id = auth.uid()
    and deleted_at is null;
end;
$$;

create or replace function public.soft_delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.job_applications
  set deleted_at = now(), updated_at = now()
  where user_id = auth.uid()
    and deleted_at is null;

  update public.user_settings
  set deleted_at = now(), updated_at = now()
  where user_id = auth.uid()
    and deleted_at is null;

  update public.profiles
  set is_active = false, deleted_at = now(), updated_at = now()
  where id = auth.uid();
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  archive_uuid uuid;
begin
  if exists (
    select 1 from public.profiles
    where id = new.id and deleted_at is not null
  ) then
    archive_uuid := gen_random_uuid();

    update public.job_applications
    set user_id = archive_uuid
    where user_id = new.id;

    update public.user_settings
    set user_id = archive_uuid
    where user_id = new.id;

    update public.profiles
    set id = archive_uuid, updated_at = now()
    where id = new.id and deleted_at is not null;
  end if;

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
