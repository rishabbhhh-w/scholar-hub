-- ====================================================================
-- SCHOLAR HUB STAGE 1 SQL MIGRATION
-- 8 Normalized Core Tables, Triggers, RLS Policies & Private Storage Setup
-- ====================================================================

-- 1. HELPER EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE (Extends auth.users, Clean defaults without fake data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'student',
    category TEXT DEFAULT NULL,
    state_of_domicile TEXT DEFAULT NULL,
    institution_name TEXT DEFAULT NULL,
    course_name TEXT DEFAULT NULL,
    roll_no TEXT DEFAULT NULL,
    dbt_active BOOLEAN DEFAULT FALSE,
    dbt_bank_name TEXT DEFAULT NULL,
    dbt_account_masked TEXT DEFAULT NULL,
    profile_completion INT DEFAULT 0,
    avatar_url TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function to check if current user is Nodal Officer or Admin
CREATE OR REPLACE FUNCTION public.is_nodal_officer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('nodal_officer', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURITY TRIGGER 1: Prevent non-admins from changing user roles
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.role IS DISTINCT FROM NEW.role) AND NOT public.is_nodal_officer() THEN
    RAISE EXCEPTION 'Security Violation: Only nodal officers or admins can modify user roles.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_role_lock ON public.profiles;
CREATE TRIGGER enforce_role_lock
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. SCHOLARSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.scholarships (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    ministry TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'ST',
    education_level TEXT NOT NULL DEFAULT 'Undergraduate',
    match_score INT DEFAULT 90,
    deadline DATE NOT NULL,
    closing_date_formatted TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    amount_formatted TEXT NOT NULL,
    amount_period TEXT NOT NULL DEFAULT 'year',
    description TEXT NOT NULL,
    eligibility_criteria TEXT[] NOT NULL DEFAULT '{}',
    required_documents TEXT[] NOT NULL DEFAULT '{}',
    benefits TEXT[] NOT NULL DEFAULT '{}',
    selection_process TEXT NOT NULL,
    sponsoring_body TEXT NOT NULL DEFAULT 'Central Ministry',
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_featured BOOLEAN DEFAULT FALSE,
    state TEXT,
    gender_eligibility TEXT DEFAULT 'All',
    max_annual_income NUMERIC,
    min_percentage_required NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ELIGIBILITY PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.eligibility_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    category TEXT NOT NULL,
    state_of_domicile TEXT NOT NULL,
    current_education_level TEXT NOT NULL,
    course_name TEXT NOT NULL,
    annual_family_income NUMERIC NOT NULL,
    last_exam_percentage NUMERIC NOT NULL,
    gender TEXT NOT NULL,
    has_disability BOOLEAN DEFAULT FALSE,
    is_first_generation_learner BOOLEAN DEFAULT FALSE,
    is_aadhaar_linked_to_bank BOOLEAN DEFAULT TRUE,
    has_valid_caste_certificate BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scholarship_id TEXT NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, scholarship_id)
);

-- 6. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scholarship_id TEXT NOT NULL REFERENCES public.scholarships(id) ON DELETE RESTRICT,
    academic_year TEXT NOT NULL DEFAULT '2026-27',
    submission_date DATE DEFAULT CURRENT_DATE,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'draft',
    stage_progress INT DEFAULT 0,
    assigned_officer TEXT DEFAULT NULL,
    assigned_office TEXT DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    action_needed TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECURITY TRIGGER 2: Lock workflow & sanction fields against student tampering
CREATE OR REPLACE FUNCTION public.prevent_application_workflow_tampering()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_nodal_officer() THEN
    IF (OLD.status IS DISTINCT FROM NEW.status) OR
       (OLD.stage_progress IS DISTINCT FROM NEW.stage_progress) OR
       (OLD.assigned_officer IS DISTINCT FROM NEW.assigned_officer) OR
       (OLD.assigned_office IS DISTINCT FROM NEW.assigned_office) OR
       (OLD.remarks IS DISTINCT FROM NEW.remarks) OR
       (OLD.action_needed IS DISTINCT FROM NEW.action_needed) THEN
      RAISE EXCEPTION 'Security Violation: Students cannot modify application workflow, sanction status, or remarks.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_application_workflow_lock ON public.applications;
CREATE TRIGGER enforce_application_workflow_lock
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.prevent_application_workflow_tampering();

-- 7. APPLICATION TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.application_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    title TEXT NOT NULL,
    event_date TEXT DEFAULT NULL,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    officer TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'in_review',
    status_text TEXT NOT NULL,
    digilocker_verified BOOLEAN DEFAULT FALSE,
    issue_authority TEXT NOT NULL,
    valid_until TEXT DEFAULT NULL,
    issue_notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal',
    action_url TEXT DEFAULT NULL,
    action_label TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES ON ALL 8 TABLES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Select profile policy" ON public.profiles;
CREATE POLICY "Select profile policy" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_nodal_officer());

DROP POLICY IF EXISTS "Update profile policy" ON public.profiles;
CREATE POLICY "Update profile policy" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_nodal_officer());

-- 2. SCHOLARSHIPS POLICIES
DROP POLICY IF EXISTS "Public select scholarships" ON public.scholarships;
CREATE POLICY "Public select scholarships" ON public.scholarships
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Nodal officer manage scholarships" ON public.scholarships;
CREATE POLICY "Nodal officer manage scholarships" ON public.scholarships
    FOR ALL USING (public.is_nodal_officer());

-- 3. ELIGIBILITY PROFILES POLICIES
DROP POLICY IF EXISTS "Eligibility profile select" ON public.eligibility_profiles;
CREATE POLICY "Eligibility profile select" ON public.eligibility_profiles
    FOR SELECT USING (auth.uid() = user_id OR public.is_nodal_officer());

DROP POLICY IF EXISTS "Eligibility profile modify" ON public.eligibility_profiles;
CREATE POLICY "Eligibility profile modify" ON public.eligibility_profiles
    FOR ALL USING (auth.uid() = user_id);

-- 4. USER BOOKMARKS POLICIES
DROP POLICY IF EXISTS "User bookmarks policy" ON public.user_bookmarks;
CREATE POLICY "User bookmarks policy" ON public.user_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- 5. APPLICATIONS POLICIES
DROP POLICY IF EXISTS "Application select policy" ON public.applications;
CREATE POLICY "Application select policy" ON public.applications
    FOR SELECT USING (auth.uid() = user_id OR public.is_nodal_officer());

DROP POLICY IF EXISTS "Student insert application" ON public.applications;
CREATE POLICY "Student insert application" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Nodal officer update application" ON public.applications;
CREATE POLICY "Nodal officer update application" ON public.applications
    FOR UPDATE USING (public.is_nodal_officer());

DROP POLICY IF EXISTS "Student delete draft application" ON public.applications;
CREATE POLICY "Student delete draft application" ON public.applications
    FOR DELETE USING (auth.uid() = user_id AND status = 'draft');

-- 6. APPLICATION TIMELINE POLICIES
DROP POLICY IF EXISTS "Timeline select policy" ON public.application_timeline;
CREATE POLICY "Timeline select policy" ON public.application_timeline
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_id AND (a.user_id = auth.uid() OR public.is_nodal_officer())
        )
    );

DROP POLICY IF EXISTS "Nodal officer timeline manage" ON public.application_timeline;
CREATE POLICY "Nodal officer timeline manage" ON public.application_timeline
    FOR ALL USING (public.is_nodal_officer());

-- 7. DOCUMENTS POLICIES
DROP POLICY IF EXISTS "Document select policy" ON public.documents;
CREATE POLICY "Document select policy" ON public.documents
    FOR SELECT USING (auth.uid() = user_id OR public.is_nodal_officer());

DROP POLICY IF EXISTS "Document insert policy" ON public.documents;
CREATE POLICY "Document insert policy" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Document update policy" ON public.documents;
CREATE POLICY "Document update policy" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id OR public.is_nodal_officer());

DROP POLICY IF EXISTS "Document delete policy" ON public.documents;
CREATE POLICY "Document delete policy" ON public.documents
    FOR DELETE USING (auth.uid() = user_id OR public.is_nodal_officer());

-- 8. NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Notifications select policy" ON public.notifications;
CREATE POLICY "Notifications select policy" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Notifications update policy" ON public.notifications;
CREATE POLICY "Notifications update policy" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Notifications delete policy" ON public.notifications;
CREATE POLICY "Notifications delete policy" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Nodal officer insert notification" ON public.notifications;
CREATE POLICY "Nodal officer insert notification" ON public.notifications
    FOR INSERT WITH CHECK (public.is_nodal_officer());

-- ====================================================================
-- PRIVATE STORAGE BUCKET & POLICIES SETUP FOR student-documents
-- ====================================================================

-- Create private bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-documents',
  'student-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage Policy 1: Authenticated student upload to own folder (user_id/*)
DROP POLICY IF EXISTS "Upload student documents to own folder" ON storage.objects;
CREATE POLICY "Upload student documents to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'student-documents' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy 2: Student read own folder OR Nodal Officer read all
DROP POLICY IF EXISTS "Read student documents policy" ON storage.objects;
CREATE POLICY "Read student documents policy"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'student-documents' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR 
    public.is_nodal_officer()
  )
);

-- Storage Policy 3: Student delete own folder object
DROP POLICY IF EXISTS "Delete student documents policy" ON storage.objects;
CREATE POLICY "Delete student documents policy"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'student-documents' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR 
    public.is_nodal_officer()
  )
);
