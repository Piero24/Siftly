-- Expand user_settings to persist full dashboard + popup preferences.

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS default_overview_scope text NOT NULL DEFAULT 'total',
  ADD COLUMN IF NOT EXISTS notifications jsonb NOT NULL DEFAULT '{"email": false}'::jsonb,
  ADD COLUMN IF NOT EXISTS privacy jsonb NOT NULL DEFAULT '{"telemetry": true, "dataRetention": 0}'::jsonb,
  ADD COLUMN IF NOT EXISTS table_display jsonb NOT NULL DEFAULT '{"visibleColumns": ["company", "position", "status", "date"], "defaultSort": "date-desc", "rowsPerPage": 20}'::jsonb,
  ADD COLUMN IF NOT EXISTS use_soft_icon_background boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_draggable boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_close_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_close_timer integer NOT NULL DEFAULT 5;

UPDATE public.user_settings
SET auto_close_timer = 5
WHERE auto_close_timer IS NULL OR auto_close_timer < 1;
