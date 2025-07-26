-- Create users table with all necessary fields for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  username VARCHAR(50) UNIQUE,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_status VARCHAR(20) DEFAULT 'free' CHECK (subscription_status IN ('free', 'starter', 'pro', 'enterprise')),
  is_email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: AdminPass123!)
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
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..2', -- AdminPass123!
  'Admin',
  'User',
  'admin_user',
  'admin',
  'enterprise',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert demo user (password: password)
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
  '$2a$12$4.rPeSt8jjNXApe3.TwZuOuVIEm5rOPuNvEqk2aJzAMAcgyEA6Tq.', -- password
  'Demo',
  'User',
  'demo_user',
  'user',
  'free',
  true
) ON CONFLICT (email) DO NOTHING;
