-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable crypto extension for security operations
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create additional schemas if needed
CREATE SCHEMA IF NOT EXISTS audit;

-- Explicit timezone setting for Singapore (UTC+8, no DST)
SET TIME ZONE 'Asia/Singapore';

-- Explicit client encoding for multilingual support
SET client_encoding = 'UTF8';

-- Grant permissions to brew_user
GRANT ALL PRIVILEGES ON SCHEMA public TO brew_user;
GRANT ALL PRIVILEGES ON SCHEMA audit TO brew_user;

-- Grant permissions to brew_user
GRANT ALL PRIVILEGES ON SCHEMA public TO brew_user;
GRANT ALL PRIVILEGES ON SCHEMA audit TO brew_user;

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    user_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);

-- Create PDPA consent records table
CREATE TABLE IF NOT EXISTS audit.consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_pseudonym VARCHAR(255) NOT NULL,
    consent_type VARCHAR(50) NOT NULL,
    consent_given BOOLEAN NOT NULL,
    consent_wording_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_user_pseudonym (user_pseudonym),
    INDEX idx_consent_type (consent_type)
);

COMMENT ON TABLE audit.audit_logs IS 'Audit trail for all system actions';
COMMENT ON TABLE audit.consent_records IS 'PDPA consent tracking with pseudonymization';
