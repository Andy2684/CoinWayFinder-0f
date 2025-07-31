CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Email preferences
    email_enabled BOOLEAN DEFAULT true,
    email_trading_alerts BOOLEAN DEFAULT true,
    email_bot_updates BOOLEAN DEFAULT true,
    email_signals BOOLEAN DEFAULT true,
    email_portfolio BOOLEAN DEFAULT true,
    email_security BOOLEAN DEFAULT true,
    email_news BOOLEAN DEFAULT false,
    email_system BOOLEAN DEFAULT true,
    email_promotions BOOLEAN DEFAULT false,
    
    -- Push notification preferences
    push_enabled BOOLEAN DEFAULT true,
    push_trading_alerts BOOLEAN DEFAULT true,
    push_bot_updates BOOLEAN DEFAULT true,
    push_signals BOOLEAN DEFAULT true,
    push_portfolio BOOLEAN DEFAULT false,
    push_security BOOLEAN DEFAULT true,
    push_news BOOLEAN DEFAULT false,
    push_system BOOLEAN DEFAULT true,
    push_promotions BOOLEAN DEFAULT false,
    
    -- SMS preferences
    sms_enabled BOOLEAN DEFAULT false,
    sms_trading_alerts BOOLEAN DEFAULT false,
    sms_bot_updates BOOLEAN DEFAULT false,
    sms_signals BOOLEAN DEFAULT false,
    sms_portfolio BOOLEAN DEFAULT false,
    sms_security BOOLEAN DEFAULT true,
    sms_news BOOLEAN DEFAULT false,
    sms_system BOOLEAN DEFAULT false,
    sms_promotions BOOLEAN DEFAULT false,
    
    -- Delivery settings
    frequency VARCHAR(20) DEFAULT 'immediate', -- immediate, hourly, daily, weekly
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Contact information
    phone_number VARCHAR(20),
    phone_verified BOOLEAN DEFAULT false,
    phone_verification_code VARCHAR(10),
    phone_verification_expires TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();
