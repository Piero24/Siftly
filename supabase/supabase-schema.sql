-- ═══════════════════════════════════════════════════════
-- Siftly — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up tables & RLS.
-- ═══════════════════════════════════════════════════════

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

-- Users can only see their own rows
create policy "Users can view own applications"
  on public.job_applications for select
  using (auth.uid() = user_id);

create policy "Users can insert own applications"
  on public.job_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on public.job_applications for update
  using (auth.uid() = user_id);

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
  on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings"
  on public.user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings"
  on public.user_settings for update using (auth.uid() = user_id);

-- ── Account Deletion RPC ─────────────────────────────
-- Called by the frontend when a user deletes their account.
-- Removes all user data; the auth user itself is deleted via
-- Supabase's admin API or a trigger.
create or replace function public.delete_user_data()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.job_applications where user_id = auth.uid();
  delete from public.user_settings    where user_id = auth.uid();
end;
$$;
