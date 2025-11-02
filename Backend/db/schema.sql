-- CATCHES
CREATE TABLE IF NOT EXISTS catches (
  id           SERIAL PRIMARY KEY,
  fish_name    VARCHAR(150)  NULL,
  weight       NUMERIC(10,2) NOT NULL,
  price        NUMERIC(12,2) NOT NULL,
  freshness    VARCHAR(50) NOT NULL,
  lake         VARCHAR(100) NOT NULL,
  fisher_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  qr_encrypted TEXT,
  verified     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ✅ Add missing column safely
ALTER TABLE IF EXISTS catches 
  ADD COLUMN IF NOT EXISTS national_id VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_catches_verified ON catches (verified);
CREATE INDEX IF NOT EXISTS idx_catches_fisher ON catches (fisher_id);
CREATE INDEX IF NOT EXISTS idx_catches_lake ON catches (lake);
