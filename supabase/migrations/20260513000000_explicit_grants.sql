-- ============================================================================
-- Siftly - Add Explicit Grants for Supabase May 30 Update
-- ============================================================================

-- profiles table
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

-- job_applications table
grant select, insert, update, delete on public.job_applications to authenticated;
grant select, insert, update, delete on public.job_applications to service_role;

-- user_settings table
grant select, insert, update, delete on public.user_settings to authenticated;
grant select, insert, update, delete on public.user_settings to service_role;
