CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  year TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS registrations
  ADD COLUMN IF NOT EXISTS checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations (email);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_checked_in ON registrations (checked_in);
