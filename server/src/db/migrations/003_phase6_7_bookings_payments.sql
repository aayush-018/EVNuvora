-- Migration 003: Phase 6 & 7 - Bookings State Machine, History, and Payments
-- EVNuvora Indian EV Charging Platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Booking & Payment Enums
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'pending', 'confirmed', 'rejected', 'cancelled', 'expired', 'in_progress', 'completed', 'disputed'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cancellation_initiator AS ENUM ('driver', 'host', 'admin', 'system');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'created', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 1. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    charger_id UUID NOT NULL REFERENCES chargers(id) ON DELETE RESTRICT,
    connector_id UUID NOT NULL REFERENCES charger_connectors(id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL,
    total_amount INT NOT NULL,         -- In paise
    breakdown_base INT NOT NULL,       -- In paise
    breakdown_parking_fee INT NOT NULL DEFAULT 0,
    breakdown_service_fee INT NOT NULL DEFAULT 0,
    status booking_status NOT NULL DEFAULT 'pending',
    cancellation_reason TEXT DEFAULT NULL,
    cancellation_initiator cancellation_initiator DEFAULT NULL,
    host_note TEXT DEFAULT NULL,
    driver_note TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Booking Status History Table (Complete audit trail)
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    from_status booking_status DEFAULT NULL,
    to_status booking_status NOT NULL,
    changed_by VARCHAR(100) NOT NULL,   -- User ID or 'system'
    reason TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT UNIQUE,
    amount INT NOT NULL,               -- In paise
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status payment_status NOT NULL DEFAULT 'created',
    provider_order_id VARCHAR(150) NOT NULL UNIQUE,
    provider_payment_id VARCHAR(150) DEFAULT NULL,
    provider_signature VARCHAR(255) DEFAULT NULL,
    method VARCHAR(50) DEFAULT NULL,    -- 'upi', 'card', 'netbanking'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast lookups & conflict checking
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_charger_id ON bookings(charger_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_timeslot ON bookings(charger_id, connector_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_booking_history_booking_id ON booking_status_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(provider_order_id);
