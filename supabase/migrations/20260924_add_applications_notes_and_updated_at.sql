-- ====================================================================
-- MIGRATION: ADD MISSING COLUMNS & TRIGGER TO PUBLIC.APPLICATIONS
-- Run this in your Supabase SQL Editor to ensure schema cache compatibility
-- ====================================================================

-- 1. Add missing columns if they do not exist
ALTER TABLE public.applications 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.applications 
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach trigger to public.applications
DROP TRIGGER IF EXISTS tr_applications_updated_at ON public.applications;
CREATE TRIGGER tr_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
