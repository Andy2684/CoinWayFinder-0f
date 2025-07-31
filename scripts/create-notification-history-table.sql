CREATE TABLE IF NOT EXISTS notification_history (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  recipients TEXT[] NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_history_type ON notification_history(type);
CREATE INDEX idx_notification_history_status ON notification_history(status);
CREATE INDEX idx_notification_history_sent_at ON notification_history(sent_at);

-- Create a view for notification statistics
CREATE OR REPLACE VIEW notification_stats AS
SELECT
  type,
  status,
  COUNT(*) as count,
  MIN(sent_at) as first_sent,
  MAX(sent_at) as last_sent,
  AVG(EXTRACT(EPOCH FROM (delivered_at - sent_at))) as avg_delivery_time_seconds
FROM notification_history
GROUP BY type, status;
