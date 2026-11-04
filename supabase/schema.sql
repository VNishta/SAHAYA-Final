-- ============================================================================
-- SAHAYA — Teacher-Assisted Adaptive Learning System
-- Production PostgreSQL Database Schema for Supabase
-- ============================================================================

-- Enable UUID generation extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Automatic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Teacher Profiles Table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  school_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Classes Table (Grades 6–10)
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  grade TEXT NOT NULL CHECK (grade IN ('Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10')),
  subject TEXT NOT NULL CHECK (char_length(trim(subject)) > 0),
  academic_year TEXT NOT NULL DEFAULT '2026–27',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);

-- 4. Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  roll_no TEXT NOT NULL CHECK (char_length(trim(roll_no)) > 0),
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_students_class_roll UNIQUE (class_id, roll_no)
);

CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON public.students(teacher_id);

-- 5. Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
  id TEXT PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  grade TEXT NOT NULL CHECK (grade IN ('Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10')),
  subject TEXT NOT NULL CHECK (char_length(trim(subject)) > 0),
  topic TEXT NOT NULL DEFAULT '',
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'finalized')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_class_id ON public.assessments(class_id);
CREATE INDEX IF NOT EXISTS idx_assessments_teacher_id ON public.assessments(teacher_id);

-- 6. Questions Table (Normalized questions belonging to an assessment)
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_order INT NOT NULL DEFAULT 0,
  question_text TEXT NOT NULL CHECK (char_length(trim(question_text)) > 0),
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option_index INT NOT NULL DEFAULT 0 CHECK (correct_option_index >= 0 AND correct_option_index <= 3),
  concept_tag TEXT NOT NULL CHECK (char_length(trim(concept_tag)) > 0),
  is_fundamental BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON public.questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_questions_teacher_id ON public.questions(teacher_id);

-- 7. Response Records Table (Stores student paper responses per assessment)
CREATE TABLE IF NOT EXISTS public.response_records (
  id TEXT PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_response_assessment_student UNIQUE (assessment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_responses_assessment_id ON public.response_records(assessment_id);
CREATE INDEX IF NOT EXISTS idx_responses_student_id ON public.response_records(student_id);
CREATE INDEX IF NOT EXISTS idx_responses_teacher_id ON public.response_records(teacher_id);

-- 8. Application Settings Table (Per-teacher configurable thresholds)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY,
  teacher_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  relearn_threshold INT NOT NULL DEFAULT 50 CHECK (relearn_threshold >= 10 AND relearn_threshold <= 75),
  practise_threshold INT NOT NULL DEFAULT 80 CHECK (practise_threshold > relearn_threshold AND practise_threshold <= 95),
  class_concept_flag_threshold INT NOT NULL DEFAULT 65 CHECK (class_concept_flag_threshold >= 30 AND class_concept_flag_threshold <= 90),
  min_questions_for_confidence INT NOT NULL DEFAULT 2 CHECK (min_questions_for_confidence >= 1 AND min_questions_for_confidence <= 5),
  active_class_id TEXT,
  ai_proxy_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attach updated_at triggers
DROP TRIGGER IF EXISTS trg_teacher_profiles_updated_at ON public.teacher_profiles;
CREATE TRIGGER trg_teacher_profiles_updated_at
  BEFORE UPDATE ON public.teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_classes_updated_at ON public.classes;
CREATE TRIGGER trg_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;
CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_assessments_updated_at ON public.assessments;
CREATE TRIGGER trg_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_response_records_updated_at ON public.response_records;
CREATE TRIGGER trg_response_records_updated_at
  BEFORE UPDATE ON public.response_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Teachers can only read and modify their own classroom records.
-- ============================================================================

ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- teacher_profiles policies
CREATE POLICY "Teachers can view own profile"
  ON public.teacher_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Teachers can insert own profile"
  ON public.teacher_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can update own profile"
  ON public.teacher_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- classes policies
CREATE POLICY "Teachers can manage own classes"
  ON public.classes FOR ALL
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- students policies
CREATE POLICY "Teachers can manage own students"
  ON public.students FOR ALL
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- assessments policies
CREATE POLICY "Teachers can manage own assessments"
  ON public.assessments FOR ALL
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- questions policies
CREATE POLICY "Teachers can manage own questions"
  ON public.questions FOR ALL
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- response_records policies
CREATE POLICY "Teachers can manage own response records"
  ON public.response_records FOR ALL
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- app_settings policies
CREATE POLICY "Teachers can manage own settings"
  ON public.app_settings FOR ALL
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);
