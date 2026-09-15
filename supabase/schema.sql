-- Supabase Schema for curA

-- 1. Create Tables

CREATE TABLE IF NOT EXISTS public.symptoms (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    emoji TEXT NOT NULL,
    color_theme TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.remedies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    rating NUMERIC NOT NULL,
    review_count INTEGER NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    how_to_use TEXT NOT NULL,
    warnings TEXT NOT NULL,
    allergen_tags TEXT[] DEFAULT '{}' NOT NULL,
    contraindications TEXT[] DEFAULT '{}' NOT NULL,
    time_to_effect TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    cost TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    ingredients TEXT[] DEFAULT '{}',
    child_safe BOOLEAN,
    child_safety_note TEXT,
    is_purchasable BOOLEAN DEFAULT true
);

ALTER TABLE public.remedies DROP CONSTRAINT IF EXISTS remedies_category_check;

ALTER TABLE public.remedies
  ADD CONSTRAINT remedies_category_check
  CHECK (category IN ('Lifestyle', 'Natural', 'Ayurveda', 'Conventional'));

CREATE TABLE IF NOT EXISTS public.remedy_symptoms (
    remedy_id TEXT REFERENCES public.remedies(id) ON DELETE CASCADE,
    symptom_id TEXT REFERENCES public.symptoms(id) ON DELETE CASCADE,
    match_strength TEXT NOT NULL DEFAULT 'primary' CHECK (match_strength IN ('primary', 'secondary')),
    PRIMARY KEY (remedy_id, symptom_id)
);

CREATE TABLE IF NOT EXISTS public.research_papers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    remedy_id TEXT REFERENCES public.remedies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    journal TEXT NOT NULL,
    url TEXT NOT NULL,
    key_findings TEXT NOT NULL,
    published_year INTEGER
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    university_email TEXT,
    university_name TEXT NOT NULL DEFAULT '',
    current_year TEXT NOT NULL DEFAULT '',
    gender TEXT,
    common_conditions TEXT[] DEFAULT '{}' NOT NULL,
    known_allergies TEXT[] DEFAULT '{}' NOT NULL,
    treatment_prefs TEXT[] DEFAULT '{}' NOT NULL,
    has_completed_onboarding BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    search_count INTEGER DEFAULT 0,
    notify_nearby_launch BOOLEAN DEFAULT false,
    prefer_natural BOOLEAN DEFAULT false NOT NULL,
    avoid_medication BOOLEAN DEFAULT false NOT NULL,
    vegetarian_remedies BOOLEAN DEFAULT false NOT NULL,
    age_range TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_age_range_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_age_range_check
  CHECK (age_range IS NULL OR age_range IN ('under-12', '12-17', '18-64', '65-plus', 'prefer-not-to-say'));

CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    remedy_id TEXT REFERENCES public.remedies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, remedy_id)
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    doctor TEXT NOT NULL,
    location TEXT NOT NULL,
    apt_date DATE NOT NULL,
    apt_time TIME NOT NULL,
    notes TEXT,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.symptom_remedies (
    symptom_id TEXT REFERENCES public.symptoms(id) ON DELETE CASCADE,
    remedy_id TEXT REFERENCES public.remedies(id) ON DELETE CASCADE,
    evidence_score INTEGER NOT NULL DEFAULT 5,
    priority_rank INTEGER NOT NULL DEFAULT 5,
    PRIMARY KEY (symptom_id, remedy_id)
);

CREATE TABLE IF NOT EXISTS public.search_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    source TEXT NOT NULL,
    query_text TEXT DEFAULT '',
    symptom_ids TEXT[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.remedy_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    remedy_id TEXT REFERENCES public.remedies(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.remedy_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    remedy_id TEXT REFERENCES public.remedies(id) ON DELETE CASCADE,
    vote TEXT NOT NULL,
    feedback_text TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.remedy_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    remedy_id TEXT NOT NULL,
    remedy_name TEXT NOT NULL,
    scheduled_time TIME NOT NULL,
    recurrence TEXT NOT NULL DEFAULT 'daily',
    days_of_week TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Row Level Security (RLS) Policies

ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remedies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remedy_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_remedies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remedy_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remedy_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remedy_schedules ENABLE ROW LEVEL SECURITY;

-- Grants for auth.users: needed by FK validation and profile-sharing RLS policies.
-- Without these, every INSERT/UPDATE/DELETE on user-owned tables fails with 42501.
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
GRANT REFERENCES ON auth.users TO authenticated;

-- Public read access for core data
DROP POLICY IF EXISTS "Allow public read access to symptoms" ON public.symptoms;
DROP POLICY IF EXISTS "Allow public read access to remedies" ON public.remedies;
DROP POLICY IF EXISTS "Allow public read access to remedy_symptoms" ON public.remedy_symptoms;
DROP POLICY IF EXISTS "Allow public read access to research_papers" ON public.research_papers;
CREATE POLICY "Allow public read access to symptoms" ON public.symptoms FOR SELECT USING (true);
CREATE POLICY "Allow public read access to remedies" ON public.remedies FOR SELECT USING (true);
CREATE POLICY "Allow public read access to remedy_symptoms" ON public.remedy_symptoms FOR SELECT USING (true);
CREATE POLICY "Allow public read access to research_papers" ON public.research_papers FOR SELECT USING (true);

-- User profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, university_email, university_name, current_year, gender)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'Student'),
    COALESCE(NEW.raw_user_meta_data ->> 'university_email', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'university_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'current_year', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'gender', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    university_email = EXCLUDED.university_email,
    university_name = EXCLUDED.university_name,
    current_year = EXCLUDED.current_year,
    gender = EXCLUDED.gender;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Favorites policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Appointments policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own appointments" ON public.appointments FOR DELETE USING (auth.uid() = user_id);

-- Validation analytics policies
DROP POLICY IF EXISTS "Anyone can insert search events" ON public.search_events;
DROP POLICY IF EXISTS "Authenticated admins can read search events" ON public.search_events;
CREATE POLICY "Anyone can insert search events" ON public.search_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated admins can read search events" ON public.search_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true
    )
);

DROP POLICY IF EXISTS "Anyone can insert remedy events" ON public.remedy_events;
DROP POLICY IF EXISTS "Authenticated admins can read remedy events" ON public.remedy_events;
CREATE POLICY "Anyone can insert remedy events" ON public.remedy_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated admins can read remedy events" ON public.remedy_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true
    )
);

DROP POLICY IF EXISTS "Anyone can insert remedy feedback" ON public.remedy_feedback;
DROP POLICY IF EXISTS "Anyone can update remedy feedback" ON public.remedy_feedback;
DROP POLICY IF EXISTS "Authenticated admins can read remedy feedback" ON public.remedy_feedback;
CREATE POLICY "Anyone can insert remedy feedback" ON public.remedy_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own remedy feedback" ON public.remedy_feedback FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated admins can read remedy feedback" ON public.remedy_feedback FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true
    )
);

-- Symptom-remedy ranking policies
DROP POLICY IF EXISTS "Allow public read access to symptom_remedies" ON public.symptom_remedies;
CREATE POLICY "Allow public read access to symptom_remedies" ON public.symptom_remedies FOR SELECT USING (true);

-- Remedy schedules policies
DROP POLICY IF EXISTS "Users can view their own schedules" ON public.remedy_schedules;
DROP POLICY IF EXISTS "Users can insert their own schedules" ON public.remedy_schedules;
DROP POLICY IF EXISTS "Users can update their own schedules" ON public.remedy_schedules;
DROP POLICY IF EXISTS "Users can delete their own schedules" ON public.remedy_schedules;
CREATE POLICY "Users can view their own schedules" ON public.remedy_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own schedules" ON public.remedy_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own schedules" ON public.remedy_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own schedules" ON public.remedy_schedules FOR DELETE USING (auth.uid() = user_id);

-- Validation analytics policies
DROP POLICY IF EXISTS "Anyone can insert search events" ON public.search_events;
DROP POLICY IF EXISTS "Authenticated users can read search events" ON public.search_events;
DROP POLICY IF EXISTS "Authenticated admins can read search events" ON public.search_events;
CREATE POLICY "Anyone can insert search events" ON public.search_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated admins can read search events" ON public.search_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true
    )
);

DROP POLICY IF EXISTS "Anyone can insert remedy events" ON public.remedy_events;
DROP POLICY IF EXISTS "Authenticated users can read remedy events" ON public.remedy_events;
DROP POLICY IF EXISTS "Authenticated admins can read remedy events" ON public.remedy_events;
CREATE POLICY "Anyone can insert remedy events" ON public.remedy_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated admins can read remedy events" ON public.remedy_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true
    )
);

DROP POLICY IF EXISTS "Anyone can insert remedy feedback" ON public.remedy_feedback;
DROP POLICY IF EXISTS "Anyone can update remedy feedback" ON public.remedy_feedback;
DROP POLICY IF EXISTS "Authenticated users can read remedy feedback" ON public.remedy_feedback;
DROP POLICY IF EXISTS "Authenticated admins can read remedy feedback" ON public.remedy_feedback;
CREATE POLICY "Anyone can insert remedy feedback" ON public.remedy_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own remedy feedback" ON public.remedy_feedback FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated admins can read remedy feedback" ON public.remedy_feedback FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true
    )
);

-- Seed catalog data separately with supabase/seed.sql.
