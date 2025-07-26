-- Create users table with all necessary fields
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    subscription_status VARCHAR(20) DEFAULT 'free' CHECK (subscription_status IN ('free', 'starter', 'pro', 'enterprise')),
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo admin user (password: AdminPass123!)
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
    '5f4dcc3b5aa765d61d8327deb882cf99:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    'Admin',
    'User',
    'admin',
    'admin',
    'enterprise',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Insert demo regular user (password: password)
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
    '5f4dcc3b5aa765d61d8327deb882cf99:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    'Demo',
    'User',
    'demo_user',
    'user',
    'free',
    TRUE
) ON CONFLICT (email) DO NOTHING;
