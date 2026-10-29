-- Migration 002: Phase 3 - Chargers, Connectors, Photos, and PostGIS Spatial Indexing
-- EVNuvora Indian EV Charging Platform

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Charger status & listing enums
DO $$ BEGIN
    CREATE TYPE charger_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'suspended', 'deactivated');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_type AS ENUM ('public', 'shared', 'private');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE charging_type AS ENUM ('AC', 'DC', 'AC_DC');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pricing_model AS ENUM ('per_kwh', 'per_hour', 'per_slot', 'fixed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE availability_status AS ENUM ('available', 'in_use', 'offline', 'unknown');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE availability_source AS ENUM ('api_confirmed', 'hardware_confirmed', 'host_confirmed', 'user_reported', 'unknown');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 1. Chargers Table
CREATE TABLE IF NOT EXISTS chargers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    approximate_area VARCHAR(150) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    listing_type listing_type NOT NULL DEFAULT 'public',
    status charger_status NOT NULL DEFAULT 'approved',
    charging_type charging_type NOT NULL DEFAULT 'AC',
    pricing_model pricing_model NOT NULL DEFAULT 'per_kwh',
    price_per_unit INT NOT NULL,            -- Price in paise (e.g. 1500 = ₹15.00)
    parking_fee INT DEFAULT NULL,           -- Parking fee in paise (e.g. 5000 = ₹50.00)
    operating_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    access_instructions TEXT DEFAULT NULL,  -- Shown only to confirmed bookers
    is_reservable BOOLEAN NOT NULL DEFAULT true,
    verification_status verification_status NOT NULL DEFAULT 'verified',
    availability_status availability_status NOT NULL DEFAULT 'available',
    availability_source availability_source NOT NULL DEFAULT 'host_confirmed',
    availability_updated_at TIMESTAMPTZ DEFAULT NOW(),
    average_rating NUMERIC(3, 2) DEFAULT NULL,
    total_reviews INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Charger Connectors Table
CREATE TABLE IF NOT EXISTS charger_connectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    charger_id UUID NOT NULL REFERENCES chargers(id) ON DELETE CASCADE,
    connector_type VARCHAR(50) NOT NULL,    -- 'type2', 'ccs2', 'chademo', 'iec60309', 'indian_socket', 'gbt_ac', 'gbt_dc'
    power_kw NUMERIC(5, 2) NOT NULL,        -- e.g. 7.4, 22.0, 50.0, 60.0 kW
    quantity INT NOT NULL DEFAULT 1,
    is_operational BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (charger_id, connector_type)
);

-- 3. Charger Photos Table
CREATE TABLE IF NOT EXISTS charger_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    charger_id UUID NOT NULL REFERENCES chargers(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption VARCHAR(255) DEFAULT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Spatial Index on Geographic Location (GIST) for high-performance radius queries
CREATE INDEX IF NOT EXISTS idx_chargers_location ON chargers USING GIST(location);

-- Standard Indexes
CREATE INDEX IF NOT EXISTS idx_chargers_host_id ON chargers(host_id);
CREATE INDEX IF NOT EXISTS idx_chargers_status ON chargers(status);
CREATE INDEX IF NOT EXISTS idx_chargers_pricing ON chargers(price_per_unit);
CREATE INDEX IF NOT EXISTS idx_charger_connectors_charger_id ON charger_connectors(charger_id);
CREATE INDEX IF NOT EXISTS idx_charger_connectors_type ON charger_connectors(connector_type);
CREATE INDEX IF NOT EXISTS idx_charger_photos_charger_id ON charger_photos(charger_id);
