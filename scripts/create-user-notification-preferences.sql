-- Create user notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Email preferences
  email_enabled BOOLEAN DEFAULT true,
  email_trading_alerts BOOLEAN DEFAULT true,
  email_bot_updates BOOLEAN DEFAULT true,
  email_signal_notifications BOOLEAN DEFAULT true,
  email_portfolio_updates BOOLEAN DEFAULT false,
  email_security_alerts BOOLEAN DEFAULT true,
  email_market_news BOOLEAN DEFAULT true,
  email_system_updates BOOLEAN DEFAULT false,
  email_promotions BOOLEAN DEFAULT false,
  
  -- Push notification preferences
  push_enabled BOOLEAN DEFAULT true,
  push_trading_alerts BOOLEAN DEFAULT true,
  push_bot_updates BOOLEAN DEFAULT false,
  push_signal_notifications BOOLEAN DEFAULT true,
  push_portfolio_updates BOOLEAN DEFAULT true,
  push_security_alerts BOOLEAN DEFAULT true,
  push_market_news BOOLEAN DEFAULT false,
  push_system_updates BOOLEAN DEFAULT true,
  push_promotions BOOLEAN DEFAULT false,
  
  -- SMS preferences
  sms_enabled BOOLEAN DEFAULT false,
  sms_trading_alerts BOOLEAN DEFAULT false,
  sms_bot_updates BOOLEAN DEFAULT false,
  sms_signal_notifications BOOLEAN DEFAULT false,
  sms_portfolio_updates BOOLEAN DEFAULT false,
  sms_security_alerts BOOLEAN DEFAULT true,
  sms_market_news BOOLEAN DEFAULT false,
  sms_system_updates BOOLEAN DEFAULT false,
  sms_promotions BOOLEAN DEFAULT false,
  
  -- Delivery preferences
  frequency VARCHAR(20) DEFAULT 'immediate', -- immediate, hourly, daily, weekly
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  
  -- Contact information
  phone_number VARCHAR(20),
  phone_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_notification_preferences_updated_at();
