-- Create compliance reports table
CREATE TABLE IF NOT EXISTS compliance_reports (
    id VARCHAR(255) PRIMARY KEY,
    framework VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    generated_at TIMESTAMP NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    overall_score INTEGER NOT NULL DEFAULT 0,
    report_data JSONB NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create compliance controls table
CREATE TABLE IF NOT EXISTS compliance_controls (
    id VARCHAR(255) PRIMARY KEY,
    framework VARCHAR(50) NOT NULL,
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    requirement TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'needs-review',
    implementation_status VARCHAR(50) NOT NULL DEFAULT 'not-implemented',
    risk_level VARCHAR(50) NOT NULL DEFAULT 'medium',
    owner VARCHAR(255),
    last_assessed TIMESTAMP,
    assessor VARCHAR(255),
    next_assessment TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create compliance findings table
CREATE TABLE IF NOT EXISTS compliance_findings (
    id VARCHAR(255) PRIMARY KEY,
    control_id VARCHAR(255) REFERENCES compliance_controls(id),
    report_id VARCHAR(255) REFERENCES compliance_reports(id),
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    impact TEXT,
    recommendation TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    identified_date TIMESTAMP NOT NULL,
    target_resolution_date TIMESTAMP,
    actual_resolution_date TIMESTAMP,
    owner VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create compliance evidence table
CREATE TABLE IF NOT EXISTS compliance_evidence (
    id VARCHAR(255) PRIMARY KEY,
    control_id VARCHAR(255) REFERENCES compliance_controls(id),
    report_id VARCHAR(255) REFERENCES compliance_reports(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    file_path VARCHAR(1000),
    url VARCHAR(1000),
    collected_date TIMESTAMP NOT NULL,
    valid_until TIMESTAMP,
    collector VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(255),
    verified_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create compliance schedules table
CREATE TABLE IF NOT EXISTS compliance_schedules (
    id VARCHAR(255) PRIMARY KEY,
    framework VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    recipients TEXT[], -- Array of email addresses
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_compliance_reports_framework ON compliance_reports(framework);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_created_at ON compliance_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_controls_framework ON compliance_controls(framework);
CREATE INDEX IF NOT EXISTS idx_compliance_controls_status ON compliance_controls(status);
CREATE INDEX IF NOT EXISTS idx_compliance_findings_severity ON compliance_findings(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_findings_status ON compliance_findings(status);
CREATE INDEX IF NOT EXISTS idx_compliance_evidence_control_id ON compliance_evidence(control_id);
CREATE INDEX IF NOT EXISTS idx_compliance_schedules_framework ON compliance_schedules(framework);
CREATE INDEX IF NOT EXISTS idx_compliance_schedules_next_run ON compliance_schedules(next_run);
