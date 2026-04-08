-- ═══════════════════════════════════════════════════════
-- Siftly — Soft Delete Migration
-- Ensures NO data is ever physically removed from the DB.
-- All "deletes" set a deleted_at timestamp instead.
-- ═══════════════════════════════════════════════════════

-- ── 1. Add deleted_at columns ───────────────────────────
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;


-- ── 2. Remove ON DELETE CASCADE from foreign keys ───────
-- This prevents Supabase admin actions from physically
-- wiping data when a user is removed from auth.users.

-- 2a. profiles.id  →  decouple from auth.users
--     The inline "references auth.users(id) on delete cascade"
--     creates a constraint named "profiles_id_fkey" by default.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Re-add as RESTRICT (blocks auth admin from deleting a user
-- whose profile row still exists — you must soft-delete first).
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE RESTRICT;

-- 2b. job_applications.user_id  →  remove cascade
ALTER TABLE public.job_applications
  DROP CONSTRAINT IF EXISTS job_applications_user_id_fkey;

-- We do NOT re-add an FK here because archived rows will have
-- a user_id that is an archive UUID (not in auth.users).
-- Referential integrity is enforced by RLS + application logic.

-- 2c. user_settings.user_id  →  remove cascade
ALTER TABLE public.user_settings
  DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

-- Same reasoning: archived settings rows will reference an
-- archive UUID that does not exist in auth.users.


-- ── 3. Update RLS policies on job_applications ──────────

-- SELECT: only return active (non-deleted) rows for the current user
DROP POLICY IF EXISTS "Users can view own applications"
  ON public.job_applications;

CREATE POLICY "Users can view own applications"
  ON public.job_applications FOR SELECT
  USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND deleted_at IS NULL
    )
  );

-- INSERT: unchanged logic, just re-created for clarity
DROP POLICY IF EXISTS "Users can insert own applications"
  ON public.job_applications;

CREATE POLICY "Users can insert own applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND deleted_at IS NULL
    )
  );

-- UPDATE: allow updates only on active rows
DROP POLICY IF EXISTS "Users can update own applications"
  ON public.job_applications;

CREATE POLICY "Users can update own applications"
  ON public.job_applications FOR UPDATE
  USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND deleted_at IS NULL
    )
  );

-- DELETE: remove the hard-delete policy entirely
DROP POLICY IF EXISTS "Users can delete own applications"
  ON public.job_applications;


-- ── 4. Update RLS policies on user_settings ─────────────

DROP POLICY IF EXISTS "Users can view own settings"
  ON public.user_settings;

CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND deleted_at IS NULL
    )
  );

-- INSERT: unchanged
DROP POLICY IF EXISTS "Users can insert own settings"
  ON public.user_settings;

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: only active settings
DROP POLICY IF EXISTS "Users can update own settings"
  ON public.user_settings;

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND deleted_at IS NULL
    )
  );


-- ── 5. Soft-delete RPCs ────────────────────────────────

-- 5a. Soft-delete a single job application
CREATE OR REPLACE FUNCTION public.soft_delete_application(app_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.job_applications
  SET deleted_at = now(), updated_at = now()
  WHERE id = app_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL;
END;
$$;

-- 5b. Bulk soft-delete all active applications for the current user
CREATE OR REPLACE FUNCTION public.soft_delete_all_applications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.job_applications
  SET deleted_at = now(), updated_at = now()
  WHERE user_id = auth.uid()
    AND deleted_at IS NULL;
END;
$$;


-- ── 6. Updated soft_delete_account() ────────────────────
-- Now cascades the soft-delete to all dependencies.
CREATE OR REPLACE FUNCTION public.soft_delete_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Soft-delete all active job applications
  UPDATE public.job_applications
  SET deleted_at = now(), updated_at = now()
  WHERE user_id = auth.uid()
    AND deleted_at IS NULL;

  -- Soft-delete user settings
  UPDATE public.user_settings
  SET deleted_at = now(), updated_at = now()
  WHERE user_id = auth.uid()
    AND deleted_at IS NULL;

  -- Soft-delete the profile
  UPDATE public.profiles
  SET is_active = false, deleted_at = now(), updated_at = now()
  WHERE id = auth.uid();
END;
$$;


-- ── 7. Updated handle_new_user() trigger ────────────────
-- When a user re-registers with the same email:
--   1. Generate ONE archive UUID
--   2. Re-key the old profile row to the archive UUID (preserving email)
--   3. Re-key ALL old dependencies to the SAME archive UUID
--   4. Create a fresh profile for the new user
-- Result: old data stays fully intact and traceable by email.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  archive_uuid uuid;
BEGIN
  -- 1. Check if a soft-deleted profile exists for this auth user ID
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = new.id AND deleted_at IS NOT NULL
  ) THEN
    -- 2. Generate ONE archive UUID for the entire old identity
    archive_uuid := gen_random_uuid();

    -- 3. Re-key ALL old dependencies to the archive UUID first
    --    (must happen before re-keying the profile, to avoid
    --     constraint issues if FKs were still present)
    UPDATE public.job_applications
    SET user_id = archive_uuid
    WHERE user_id = new.id;

    UPDATE public.user_settings
    SET user_id = archive_uuid
    WHERE user_id = new.id;

    -- 4. Re-key the old profile row to the archive UUID
    --    This preserves: email, full_name, avatar_url,
    --    deleted_at, created_at — the full audit trail.
    UPDATE public.profiles
    SET id = archive_uuid, updated_at = now()
    WHERE id = new.id AND deleted_at IS NOT NULL;
  END IF;

  -- 5. Create a fresh profile for the new registration
  INSERT INTO public.profiles (id, email, full_name, avatar_url, is_active, deleted_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    true,
    NULL
  );

  RETURN new;
END;
$$;


-- ── 8. Performance index ────────────────────────────────
-- Partial index: only indexes active (non-deleted) rows,
-- which is what the app queries 99% of the time.
CREATE INDEX IF NOT EXISTS idx_job_applications_active
  ON public.job_applications(user_id, deleted_at)
  WHERE deleted_at IS NULL;
