# Technical Security Runbooks

## Quick Reference Commands

### Emergency Response Commands

#### Immediate IP Blocking
\`\`\`bash
# Block IP at application level
redis-cli SADD blocked_ips "192.168.1.100"

# Block IP at firewall level (Linux)
sudo iptables -A INPUT -s 192.168.1.100 -j DROP

# Block IP at nginx level
echo "deny 192.168.1.100;" >> /etc/nginx/conf.d/blocked_ips.conf
sudo nginx -s reload
\`\`\`

#### Emergency System Isolation
\`\`\`bash
# Stop application services
sudo systemctl stop coinwayfinder-app
sudo systemctl stop nginx

# Isolate database
sudo systemctl stop postgresql
sudo systemctl stop redis-server

# Network isolation
sudo iptables -A INPUT -j DROP
sudo iptables -A OUTPUT -j DROP
\`\`\`

#### Log Collection
\`\`\`bash
# Collect application logs
tar -czf incident-logs-$(date +%Y%m%d-%H%M%S).tar.gz \
  /var/log/coinwayfinder/ \
  /var/log/nginx/ \
  /var/log/postgresql/ \
  /var/log/redis/

# Database query logs
sudo -u postgres pg_dump --verbose --clean --no-owner --no-acl \
  --format=custom coinwayfinder_db > db_backup_$(date +%Y%m%d-%H%M%S).dump
\`\`\`

### SQL Injection Response

#### Immediate Database Protection
\`\`\`sql
-- Revoke dangerous permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;
GRANT SELECT, INSERT, UPDATE ON specific_tables TO app_user;

-- Check for unauthorized data access
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats 
WHERE schemaname = 'public' 
AND last_analyzed > '[INCIDENT_TIME]';

-- Audit recent queries
SELECT query, query_start, state, client_addr
FROM pg_stat_activity 
WHERE query_start > '[INCIDENT_TIME]'
AND query NOT LIKE '%pg_stat_activity%';
\`\`\`

#### Application Code Emergency Patch
\`\`\`javascript
// Emergency input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(;|\||&)/g,
    /('|(\\'))/g
  ];
  
  let sanitized = input;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim();
};

// Emergency middleware deployment
app.use((req, res, next) => {
  // Sanitize all inputs
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitizeInput(req.body[key]);
    });
  }
  
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitizeInput(req.query[key]);
    });
  }
  
  next();
});
\`\`\`

### XSS Attack Response

#### Content Security Policy Emergency Update
\`\`\`javascript
// Emergency CSP headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-src 'none'; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});
\`\`\`

#### Output Sanitization
\`\`\`javascript
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Emergency output sanitization
const sanitizeOutput = (html) => {
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

// Apply to all responses
app.use((req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (typeof data === 'string' && data.includes('<')) {
      data = sanitizeOutput(data);
    }
    originalSend.call(this, data);
  };
  
  next();
});
\`\`\`

### Brute Force Attack Response

#### Emergency Rate Limiting
\`\`\`javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

// Emergency strict rate limiting
const emergencyLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'emergency_rl:'
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Emergency rate limit active. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // Log emergency rate limit hit
    console.error(`Emergency rate limit hit: ${req.ip} - ${req.path}`);
    
    // Block IP for 1 hour
    redis.setex(`blocked:${req.ip}`, 3600, 'emergency_block');
    
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: 3600
    });
  }
});

app.use('/api/auth', emergencyLimiter);
\`\`\`

#### Account Protection
\`\`\`javascript
// Emergency account lockout
const lockAccount = async (username, reason) => {
  await redis.setex(`locked:${username}`, 3600, JSON.stringify({
    reason,
    timestamp: new Date().toISOString(),
    unlockTime: new Date(Date.now() + 3600000).toISOString()
  }));
  
  // Invalidate all sessions
  const sessions = await redis.keys(`session:${username}:*`);
  if (sessions.length > 0) {
    await redis.del(...sessions);
  }
  
  console.log(`Account locked: ${username} - Reason: ${reason}`);
};

// Check for brute force patterns
const checkBruteForce = async (username, ip) => {
  const failedAttempts = await redis.incr(`failed:${username}:${ip}`);
  await redis.expire(`failed:${username}:${ip}`, 900); // 15 minutes
  
  if (failedAttempts >= 5) {
    await lockAccount(username, 'Brute force attack detected');
    await redis.setex(`blocked:${ip}`, 3600, 'brute_force');
    return true;
  }
  
  return false;
};
\`\`\`

### Database Security Hardening

#### Emergency Database Lockdown
\`\`\`sql
-- Create emergency read-only user
CREATE USER emergency_readonly WITH PASSWORD 'secure_temp_password';
GRANT CONNECT ON DATABASE coinwayfinder_db TO emergency_readonly;
GRANT USAGE ON SCHEMA public TO emergency_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO emergency_readonly;

-- Revoke dangerous permissions from app user
REVOKE CREATE, DROP, ALTER ON SCHEMA public FROM app_user;
REVOKE DELETE ON sensitive_tables FROM app_user;

-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 0;
SELECT pg_reload_conf();

-- Monitor active connections
SELECT pid, usename, application_name, client_addr, query_start, query
FROM pg_stat_activity 
WHERE state = 'active' 
AND usename != 'postgres';
\`\`\`

#### Data Integrity Verification
\`\`\`sql
-- Check for data tampering
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
       n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables 
ORDER BY n_tup_upd + n_tup_del DESC;

-- Verify critical data
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as transaction_count FROM transactions;
SELECT SUM(balance) as total_balance FROM user_balances;

-- Check for suspicious modifications
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
AND column_name LIKE '%password%' OR column_name LIKE '%token%';
\`\`\`

### Network Security Response

#### Traffic Analysis
\`\`\`bash
# Monitor network connections
netstat -tulpn | grep :443
netstat -tulpn | grep :80
netstat -tulpn | grep :5432

# Analyze traffic patterns
tcpdump -i eth0 -n -c 1000 port 80 | \
  awk '{print $3}' | cut -d. -f1-4 | sort | uniq -c | sort -nr

# Check for DDoS patterns
ss -tuln | grep :80 | wc -l
\`\`\`

#### Firewall Emergency Rules
\`\`\`bash
# Block specific countries (example: block China and Russia)
iptables -A INPUT -m geoip --src-cc CN -j DROP
iptables -A INPUT -m geoip --src-cc RU -j DROP

# Rate limit new connections
iptables -A INPUT -p tcp --dport 80 -m state --state NEW \
  -m recent --set --name HTTP
iptables -A INPUT -p tcp --dport 80 -m state --state NEW \
  -m recent --update --seconds 1 --hitcount 10 --name HTTP -j DROP

# Block common attack patterns
iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP
iptables -A INPUT -p tcp --tcp-flags ALL ALL -j DROP
iptables -A INPUT -p tcp --tcp-flags ALL FIN,URG,PSH -j DROP
\`\`\`

### Application Recovery Procedures

#### Safe Application Restart
\`\`\`bash
#!/bin/bash
# safe_restart.sh

echo "Starting safe application restart..."

# 1. Enable maintenance mode
echo "Enabling maintenance mode..."
touch /var/www/coinwayfinder/maintenance.flag

# 2. Gracefully stop services
echo "Stopping application services..."
sudo systemctl stop coinwayfinder-app
sleep 5

# 3. Backup current state
echo "Creating backup..."
pg_dump coinwayfinder_db > /backup/emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 4. Clear potentially compromised cache
echo "Clearing cache..."
redis-cli FLUSHDB

# 5. Update security configurations
echo "Updating security configurations..."
cp /etc/nginx/nginx.conf.secure /etc/nginx/nginx.conf
cp /app/config/security.conf.emergency /app/config/security.conf

# 6. Restart services with enhanced monitoring
echo "Restarting services..."
sudo systemctl start postgresql
sudo systemctl start redis-server
sudo systemctl start nginx
sudo systemctl start coinwayfinder-app

# 7. Verify services
echo "Verifying services..."
sleep 10
curl -f http://localhost/health || exit 1

# 8. Disable maintenance mode
echo "Disabling maintenance mode..."
rm /var/www/coinwayfinder/maintenance.flag

echo "Safe restart completed successfully!"
\`\`\`

#### Database Recovery
\`\`\`sql
-- Emergency database recovery procedures

-- 1. Check database integrity
SELECT pg_database.datname, pg_database_size(pg_database.datname) 
FROM pg_database;

-- 2. Verify table integrity
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats WHERE schemaname = 'public';

-- 3. Restore from backup if needed
-- pg_restore --verbose --clean --no-acl --no-owner -h localhost -U postgres -d coinwayfinder_db backup.dump

-- 4. Reset sequences
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('transactions', 'id'), COALESCE(MAX(id), 1)) FROM transactions;

-- 5. Rebuild indexes
REINDEX DATABASE coinwayfinder_db;

-- 6. Update statistics
ANALYZE;
\`\`\`

### Monitoring and Alerting

#### Enhanced Monitoring Setup
\`\`\`javascript
// Enhanced security monitoring
const monitoringConfig = {
  // Failed authentication monitoring
  authFailures: {
    threshold: 5,
    timeWindow: 300000, // 5 minutes
    action: 'block_ip'
  },
  
  // SQL injection monitoring
  sqlInjection: {
    patterns: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(;|\||&)/g
    ],
    action: 'immediate_block'
  },
  
  // XSS monitoring
  xssAttempts: {
    patterns: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ],
    action: 'sanitize_and_log'
  }
};

// Real-time monitoring middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Monitor request patterns
  const requestData = {
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // XSS attempts
    /union\s+select/gi, // SQL injection
    /exec\s*\(/gi // Command injection
  ];
  
  const requestString = JSON.stringify(req.body) + req.url;
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(requestString)
  );
  
  if (isSuspicious) {
    console.error('Suspicious request detected:', requestData);
    // Log to security monitoring system
    securityMonitor.logSecurityEvent({
      type: 'suspicious_request',
      severity: 'high',
      source: req.path,
      ip: req.ip,
      details: { requestData, suspiciousContent: requestString }
    });
  }
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Log slow responses (potential DoS)
    if (responseTime > 5000) {
      console.warn('Slow response detected:', {
        ...requestData,
        responseTime,
        statusCode: res.statusCode
      });
    }
  });
  
  next();
});
\`\`\`

### Communication Scripts

#### Automated Alert Notifications
\`\`\`javascript
// automated-alerts.js
const nodemailer = require('nodemailer');
const slack = require('@slack/web-api');

class AlertNotificationSystem {
  constructor() {
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    this.slackClient = new slack.WebClient(process.env.SLACK_TOKEN);
  }
  
  async sendCriticalAlert(incident) {
    const message = this.formatCriticalAlert(incident);
    
    // Send email to security team
    await this.emailTransporter.sendMail({
      from: 'security@coinwayfinder.com',
      to: 'security-team@coinwayfinder.com',
      subject: `🚨 CRITICAL SECURITY INCIDENT: ${incident.type}`,
      html: message.html
    });
    
    // Send Slack notification
    await this.slackClient.chat.postMessage({
      channel: '#security-alerts',
      text: message.slack,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Incident Type', value: incident.type, short: true },
          { title: 'Severity', value: incident.severity, short: true },
          { title: 'Source IP', value: incident.ip || 'Unknown', short: true },
          { title: 'Timestamp', value: incident.timestamp, short: true }
        ]
      }]
    });
    
    // Send SMS for critical incidents
    if (incident.severity === 'critical') {
      await this.sendSMS(incident);
    }
  }
  
  formatCriticalAlert(incident) {
    return {
      html: `
        <h2>🚨 CRITICAL SECURITY INCIDENT</h2>
        <p><strong>Type:</strong> ${incident.type}</p>
        <p><strong>Severity:</strong> ${incident.severity}</p>
        <p><strong>Time:</strong> ${incident.timestamp}</p>
        <p><strong>Source:</strong> ${incident.source}</p>
        <p><strong>IP Address:</strong> ${incident.ip || 'Unknown'}</p>
        <p><strong>Details:</strong> ${JSON.stringify(incident.details, null, 2)}</p>
        
        <h3>Immediate Actions Required:</h3>
        <ul>
          <li>Review incident in security dashboard</li>
          <li>Verify containment measures</li>
          <li>Begin investigation procedures</li>
          <li>Notify management if required</li>
        </ul>
        
        <p><a href="https://coinwayfinder.com/admin/security-monitor">View Security Dashboard</a></p>
      `,
      slack: `🚨 CRITICAL SECURITY INCIDENT: ${incident.type}\nSeverity: ${incident.severity}\nIP: ${incident.ip || 'Unknown'}\nTime: ${incident.timestamp}`
    };
  }
  
  async sendSMS(incident) {
    // SMS implementation for critical alerts
    console.log(`SMS Alert: Critical incident ${incident.type} detected`);
  }
}

module.exports = new AlertNotificationSystem();
\`\`\`

This comprehensive technical runbook provides immediate response procedures, emergency commands, and recovery scripts for all security incident types. The documentation includes both high-level procedures and specific technical implementations that can be executed during security incidents.
\`\`\`

Now let me create incident tracking templates:
