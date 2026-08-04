-- ═══════════════════════════════════════════════════════════
-- STUDY PLANNER TABLES — AI-powered study schedule for KSSM students
-- ═══════════════════════════════════════════════════════════

-- Study Profiles: stores student preferences & settings
CREATE TABLE study_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tingkatan INT CHECK (tingkatan BETWEEN 1 AND 5),
  subjects TEXT[] NOT NULL,
  weak_subjects JSONB DEFAULT '{}',
  daily_hours DECIMAL(3,1) DEFAULT 2.0,
  exam_date DATE,
  dashboard_mode TEXT CHECK (dashboard_mode IN ('muslim', 'universal')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Plans: weekly AI-generated schedules
CREATE TABLE study_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES study_profiles(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  week_number INT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'adjusted')),
  generated_by TEXT DEFAULT 'agent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Progress: tracks completion & scores per chapter
CREATE TABLE study_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  score DECIMAL(5,2),
  time_spent_minutes INT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ Row Level Security ═══
ALTER TABLE study_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own study profile" ON study_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own study plans" ON study_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own progress" ON study_progress FOR ALL USING (auth.uid() = user_id);
