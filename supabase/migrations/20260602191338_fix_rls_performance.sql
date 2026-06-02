-- ============================================================================
-- Siftly - Fix Supabase RLS Performance Warnings
-- ============================================================================
-- Replaces auth.uid() with (select auth.uid()) in RLS policies to allow the 
-- Postgres query planner to treat it as an initplan, evaluating it only once.

-- ----------------------------------------------------------------------------
-- Profiles
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = id and deleted_at is null);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id and deleted_at is null);

-- ----------------------------------------------------------------------------
-- Job Applications
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view own applications" on public.job_applications;
create policy "Users can view own applications"
  on public.job_applications for select
  using (
    (select auth.uid()) = user_id
    and deleted_at is null
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and deleted_at is null
    )
  );

drop policy if exists "Users can insert own applications" on public.job_applications;
create policy "Users can insert own applications"
  on public.job_applications for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and deleted_at is null
    )
  );

drop policy if exists "Users can update own applications" on public.job_applications;
create policy "Users can update own applications"
  on public.job_applications for update
  using (
    (select auth.uid()) = user_id
    and deleted_at is null
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and deleted_at is null
    )
  );

-- ----------------------------------------------------------------------------
-- User Settings
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view own settings" on public.user_settings;
create policy "Users can view own settings"
  on public.user_settings for select
  using (
    (select auth.uid()) = user_id
    and deleted_at is null
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and deleted_at is null
    )
  );

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
  on public.user_settings for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
  on public.user_settings for update
  using (
    (select auth.uid()) = user_id
    and deleted_at is null
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and deleted_at is null
    )
  );
