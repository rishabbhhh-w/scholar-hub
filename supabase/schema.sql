-- ====================================================================
-- SCHOLAR HUB SUPABASE PRODUCTION SCHEMA & RLS POLICIES
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'nodal_officer')),
    category TEXT NOT NULL DEFAULT 'ST' CHECK (category IN ('ST', 'SC', 'OBC', 'General', 'Minority')),
    state TEXT NOT NULL DEFAULT 'Jharkhand',
    institution TEXT NOT NULL DEFAULT 'Central University of Jharkhand',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function to check if current user is admin or nodal officer
CREATE OR REPLACE FUNCTION public.is_officer_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'nodal_officer')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, category, state, institution)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'category', 'ST'),
    COALESCE(NEW.raw_user_meta_data->>'state', 'Jharkhand'),
    COALESCE(NEW.raw_user_meta_data->>'institution', 'Central University of Jharkhand')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    category = EXCLUDED.category,
    state = EXCLUDED.state,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. SCHOLARSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.scholarships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount_monthly NUMERIC NOT NULL,
    deadline DATE NOT NULL,
    category_eligible TEXT[] NOT NULL DEFAULT '{"ST","SC","OBC","Minority","General"}',
    level TEXT NOT NULL DEFAULT 'Post-Matric' CHECK (level IN ('Pre-Matric', 'Post-Matric', 'UG', 'PG', 'PhD')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'disbursed')),
    tracking_number TEXT UNIQUE NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- AUTOMATIC TRACKING NUMBER GENERATOR TRIGGER
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := 'NSH-2026-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_applications_tracking_no ON public.applications;
CREATE TRIGGER tr_applications_tracking_no
BEFORE INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.generate_tracking_number();

DROP TRIGGER IF EXISTS tr_applications_updated_at ON public.applications;
CREATE TRIGGER tr_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('verified', 'pending', 'flagged')),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'System Notification',
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('deadline', 'verification', 'disbursement', 'info')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile or officers view all" ON public.profiles;
CREATE POLICY "Users can view own profile or officers view all" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_officer_or_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_officer_or_admin());

-- 2. SCHOLARSHIPS POLICIES
DROP POLICY IF EXISTS "Anyone authenticated can view scholarships" ON public.scholarships;
CREATE POLICY "Anyone authenticated can view scholarships" ON public.scholarships
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert/update/delete scholarships" ON public.scholarships;
CREATE POLICY "Admins can insert/update/delete scholarships" ON public.scholarships
    FOR ALL USING (public.is_officer_or_admin());

-- 3. APPLICATIONS POLICIES
DROP POLICY IF EXISTS "Students view own applications or officers view all" ON public.applications;
CREATE POLICY "Students view own applications or officers view all" ON public.applications
    FOR SELECT USING (auth.uid() = user_id OR public.is_officer_or_admin());

DROP POLICY IF EXISTS "Students create own applications" ON public.applications;
CREATE POLICY "Students create own applications" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Officers can update application status" ON public.applications;
CREATE POLICY "Officers can update application status" ON public.applications
    FOR UPDATE USING (public.is_officer_or_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Students delete own pending applications" ON public.applications;
CREATE POLICY "Students delete own pending applications" ON public.applications
    FOR DELETE USING (auth.uid() = user_id OR public.is_officer_or_admin());

-- 4. DOCUMENTS POLICIES
DROP POLICY IF EXISTS "Users can view own documents or officers view all" ON public.documents;
CREATE POLICY "Users can view own documents or officers view all" ON public.documents
    FOR SELECT USING (auth.uid() = user_id OR public.is_officer_or_admin());

DROP POLICY IF EXISTS "Users can manage own documents" ON public.documents;
CREATE POLICY "Users can manage own documents" ON public.documents
    FOR ALL USING (auth.uid() = user_id OR public.is_officer_or_admin());

-- 5. NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id OR public.is_officer_or_admin());

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id OR public.is_officer_or_admin());

DROP POLICY IF EXISTS "Officers send notifications" ON public.notifications;
CREATE POLICY "Officers send notifications" ON public.notifications
    FOR INSERT WITH CHECK (public.is_officer_or_admin() OR auth.uid() = user_id);

-- ====================================================================
-- SUPABASE STORAGE CONFIGURATION FOR BUCKET 'documents'
-- Max File Size: 10MB (10485760 bytes), Allowed Mime Types: pdf, jpg, png
-- ====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

DROP POLICY IF EXISTS "Users can upload own documents to storage" ON storage.objects;
CREATE POLICY "Users can upload own documents to storage" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can read own documents from storage" ON storage.objects;
CREATE POLICY "Users can read own documents from storage" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR public.is_officer_or_admin()
    )
  );

DROP POLICY IF EXISTS "Users can delete own documents from storage" ON storage.objects;
CREATE POLICY "Users can delete own documents from storage" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
  );
