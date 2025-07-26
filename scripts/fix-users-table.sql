-- Fix users table by adding missing columns and updating existing data
-- This script is safe to run multiple times

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add role column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    END IF;
    
    -- Add subscription_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
        ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'free';
    END IF;
    
    -- Add is_email_verified column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_email_verified') THEN
        ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add email_verification_token column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verification_token') THEN
        ALTER TABLE users ADD COLUMN email_verification_token TEXT;
    END IF;
    
    -- Add password_reset_token column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_reset_token') THEN
        ALTER TABLE users ADD COLUMN password_reset_token TEXT;
    END IF;
    
    -- Add password_reset_expires column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_reset_expires') THEN
        ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP;
    END IF;
    
    -- Add last_login column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
    END IF;
    
    -- Add updated_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Update existing users to have default values
UPDATE users SET role = 'user' WHERE role IS NULL;
UPDATE users SET subscription_status = 'free' WHERE subscription_status IS NULL;
UPDATE users SET is_email_verified = FALSE WHERE is_email_verified IS NULL;
UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;

-- Add constraints if they don't exist
DO $$ 
BEGIN
    -- Add role constraint
    BEGIN
        ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Add subscription status constraint
    BEGIN
        ALTER TABLE users ADD CONSTRAINT users_subscription_status_check CHECK (subscription_status IN ('free', 'starter', 'pro', 'enterprise'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo users with proper password hashes
INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    username, 
    role, 
    subscription_status, 
    is_email_verified
) VALUES (
    'admin@coinwayfinder.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJgusgqSK',
    'Admin',
    'User',
    'admin',
    'admin',
    'enterprise',
    TRUE
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    subscription_status = EXCLUDED.subscription_status,
    is_email_verified = EXCLUDED.is_email_verified;

INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    username, 
    role, 
    subscription_status, 
    is_email_verified
) VALUES (
    'demo@coinwayfinder.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJgusgqSK',
    'Demo',
    'User',
    'demo_user',
    'user',
    'free',
    TRUE
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    subscription_status = EXCLUDED.subscription_status,
    is_email_verified = EXCLUDED.is_email_verified;
