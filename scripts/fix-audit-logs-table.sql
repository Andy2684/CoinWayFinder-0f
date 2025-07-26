-- Fix audit logs table to handle IP addresses properly
DO $$ 
BEGIN
    -- Check if audit_logs table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        -- Change ip_address column from inet to varchar if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'ip_address') THEN
            -- Drop the column and recreate it as varchar
            ALTER TABLE audit_logs DROP COLUMN IF EXISTS ip_address;
            ALTER TABLE audit_logs ADD COLUMN ip_address VARCHAR(45);
        END IF;
    ELSE
        -- Create audit_logs table if it doesn't exist
        CREATE TABLE audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            event_type VARCHAR(100) NOT NULL,
            event_category VARCHAR(50) NOT NULL,
            event_description TEXT,
            ip_address VARCHAR(45),
            user_agent TEXT,
            risk_level VARCHAR(20) DEFAULT 'low',
            success BOOLEAN DEFAULT TRUE,
            error_message TEXT,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit_logs(risk_level);
    END IF;
END $$;
