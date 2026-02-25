-- Per-user application status tracking for shared opportunities
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_opportunity_status (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'saved'
                   CHECK (status IN ('saved','applied','interview','accepted','rejected')),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, opportunity_id)
);

ALTER TABLE user_opportunity_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own status"
  ON user_opportunity_status FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS uos_user_id_idx ON user_opportunity_status(user_id);
