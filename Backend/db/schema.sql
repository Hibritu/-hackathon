-- PostgreSQL schema for FishLink/FF-TMS (node-postgres / pg)
-- Idempotent: safe to run multiple times

-- Extensions (optional)
-- Uncomment if you want UUIDs. Current code uses serial integers.
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  phone           VARCHAR(30),
  email           VARCHAR(255) UNIQUE,
  password        VARCHAR(255),
  role            VARCHAR(30) NOT NULL DEFAULT 'BUYER',
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Ensure required columns exist on pre-existing installations
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS name VARCHAR(150);
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
-- If role exists as an enum, widen it to VARCHAR(30) to accept values like 'ADMIN'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='role' AND data_type='USER-DEFINED'
  ) THEN
    BEGIN
      ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(30) USING role::text;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;
END$$;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'BUYER';
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- Add unique constraint on email if not existing (ignore errors if duplicates exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conrelid = 'users'::regclass
    AND    conname = 'users_email_key'
  ) THEN
    BEGIN
      ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
    EXCEPTION WHEN duplicate_table THEN
      -- ignore
      NULL;
    END;
  END IF;
END$$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- CATCHES
CREATE TABLE IF NOT EXISTS catches (
  id           SERIAL PRIMARY KEY,
  fish_name    VARCHAR(150) NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_catches_verified ON catches (verified);
CREATE INDEX IF NOT EXISTS idx_catches_fisher ON catches (fisher_id);
CREATE INDEX IF NOT EXISTS idx_catches_lake ON catches (lake);

-- Trigger to update updated_at on changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_timestamp'
  ) THEN
    CREATE OR REPLACE FUNCTION set_timestamp()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_catches_set_timestamp'
  ) THEN
    CREATE TRIGGER trg_catches_set_timestamp
    BEFORE UPDATE ON catches
    FOR EACH ROW
    EXECUTE FUNCTION set_timestamp();
  END IF;
END$$;

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  buyer_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catch_id        INTEGER NOT NULL REFERENCES catches(id) ON DELETE CASCADE,
  payment_status  VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_catch ON orders (catch_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_orders_set_timestamp'
  ) THEN
    CREATE TRIGGER trg_orders_set_timestamp
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_timestamp();
  END IF;
END$$;

-- Optional role check constraint (keep flexible for hackathon)
-- ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('ADMIN','AGENT','FISHER','BUYER'));

-- REPRESENTATIVES (Digital agent / cooperative support)
-- A representative is a USER with role 'AGENT' or 'REPRESENTATIVE'.
-- This table captures optional profile fields and relationships.
CREATE TABLE IF NOT EXISTS representatives (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  cooperative_name  VARCHAR(150),
  region            VARCHAR(100),
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Map fishermen to their representative (optional)
ALTER TABLE IF EXISTS catches
  ADD COLUMN IF NOT EXISTS representative_id INTEGER NULL REFERENCES representatives(id) ON DELETE SET NULL;

-- DELIVERY MODULE
-- Delivery personnel are USERS with role 'DELIVERY'.
CREATE TABLE IF NOT EXISTS deliveries (
  id                    SERIAL PRIMARY KEY,
  order_id              INTEGER NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  delivery_person_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status                VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, PICKED, IN_TRANSIT, DELIVERED, FAILED
  notes                 TEXT,
  picked_at             TIMESTAMP WITH TIME ZONE,
  delivered_at          TIMESTAMP WITH TIME ZONE,
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_person ON deliveries(delivery_person_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_deliveries_set_timestamp'
  ) THEN
    CREATE TRIGGER trg_deliveries_set_timestamp
    BEFORE UPDATE ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION set_timestamp();
  END IF;
END$$;

-- LEDGER ENTRIES (2% platform fee + seller credit)
CREATE TABLE IF NOT EXISTS ledger_entries (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  entry_type   VARCHAR(30) NOT NULL, -- PLATFORM_FEE, SELLER_CREDIT
  amount       NUMERIC(12,2) NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_order ON ledger_entries(order_id);
CREATE INDEX IF NOT EXISTS idx_ledger_type ON ledger_entries(entry_type);

