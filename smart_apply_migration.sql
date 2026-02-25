-- Smart Apply Packages table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS smart_apply_packages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id    UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  opportunity_title TEXT NOT NULL,
  cover_letter      TEXT NOT NULL,
  personal_statement TEXT NOT NULL,
  short_answers     JSONB NOT NULL DEFAULT '[]',
  document_checklist JSONB NOT NULL DEFAULT '[]',
  submission_tips   JSONB NOT NULL DEFAULT '[]',
  tailoring_notes   TEXT,
  estimated_prep_time TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security: users can only access their own packages
ALTER TABLE smart_apply_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own smart apply packages"
  ON smart_apply_packages
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS smart_apply_packages_user_id_idx ON smart_apply_packages(user_id);
CREATE INDEX IF NOT EXISTS smart_apply_packages_created_at_idx ON smart_apply_packages(created_at DESC);
