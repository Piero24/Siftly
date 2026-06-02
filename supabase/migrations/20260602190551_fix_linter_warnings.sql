-- ============================================================================
-- Siftly - Fix Supabase Linter Warnings
-- ============================================================================

-- Drop the unused function that has a mutable search_path
DROP FUNCTION IF EXISTS public.delete_user_data();

-- ----------------------------------------------------------------------------
-- Change RPC functions to SECURITY INVOKER
-- This fixes the 'anon_security_definer_function_executable' and
-- 'authenticated_security_definer_function_executable' warnings.
-- Because RLS policies are enabled on job_applications, user_settings, and 
-- profiles, these functions will still correctly restrict access based on auth.uid().
-- ----------------------------------------------------------------------------

create or replace function public.soft_delete_application(app_id text)
returns void
language plpgsql
security invoker
set search_path = ''
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
security invoker
set search_path = ''
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
security invoker
set search_path = ''
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

-- ----------------------------------------------------------------------------
-- Fix Trigger Function
-- Revoke EXECUTE from PUBLIC so that only the database trigger can run it.
-- ----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
