-- Create audit_logs table for comprehensive security event logging
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(30) NOT NULL,
  event_description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  request_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  risk_level VARCHAR(20) DEFAULT 'low',
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '2 years')
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_category ON audit_logs(event_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);
CREATE INDEX IF NOT EXISTS idx_audit_logs_expires_at ON audit_logs(expires_at);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_category ON audit_logs(user_id, event_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category_time ON audit_logs(event_category, created_at DESC);

-- Create function to automatically clean up old logs
CREATE OR REPLACE FUNCTION cleanup_expired_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs WHERE expires_at < CURRENT_TIMESTAMP;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create view for recent security events
CREATE OR REPLACE VIEW recent_security_events AS
SELECT 
  al.*,
  u.email,
  u.username,
  u.first_name,
  u.last_name
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY al.created_at DESC;

-- Insert some sample audit log data for testing
INSERT INTO audit_logs (event_type, event_category, event_description, ip_address, user_agent, risk_level, metadata) VALUES
('system_startup', 'system', 'Application started successfully', '127.0.0.1', 'System', 'low', '{"version": "1.0.0", "environment": "development"}'),
('database_migration', 'system', 'Audit logs table created', '127.0.0.1', 'System', 'low', '{"migration": "create-audit-logs-table"}');

-- Create trigger to prevent modification of audit logs (immutable)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Audit logs cannot be modified';
  END IF;
  IF TG_OP = 'DELETE' AND OLD.expires_at > CURRENT_TIMESTAMP THEN
    RAISE EXCEPTION 'Active audit logs cannot be deleted';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_modification_trigger
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
