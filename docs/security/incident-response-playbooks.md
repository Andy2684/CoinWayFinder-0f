# Security Incident Response Playbooks

## Overview

This document provides step-by-step procedures for responding to different types of security incidents detected by our monitoring system. Each playbook includes immediate response actions, investigation steps, containment measures, and recovery procedures.

## General Incident Response Process

### 1. Detection & Alert Triage (0-5 minutes)
- Alert received via monitoring system
- Initial severity assessment
- Assign incident commander
- Create incident tracking ticket

### 2. Initial Response (5-15 minutes)
- Gather initial evidence
- Assess scope and impact
- Implement immediate containment
- Notify stakeholders if required

### 3. Investigation & Analysis (15-60 minutes)
- Deep dive investigation
- Root cause analysis
- Document findings
- Determine full scope

### 4. Containment & Eradication (Variable)
- Implement containment measures
- Remove threat/vulnerability
- Patch systems if needed
- Verify containment effectiveness

### 5. Recovery & Monitoring (Variable)
- Restore normal operations
- Enhanced monitoring
- Validate system integrity
- Document lessons learned

### 6. Post-Incident Review (24-48 hours)
- Conduct post-mortem
- Update procedures
- Implement improvements
- Share learnings with team

---

## Critical Severity Playbooks

### 🚨 SQL Injection Attempt

**Severity:** CRITICAL  
**Response Time:** Immediate (< 5 minutes)  
**Escalation:** Security team + Engineering lead + CTO

#### Immediate Actions (0-5 minutes)
1. **Alert Acknowledgment**
   - Acknowledge alert in monitoring system
   - Create incident ticket: `SEC-SQLI-YYYY-MM-DD-XXX`
   - Notify security team via Slack/PagerDuty

2. **Initial Assessment**
   \`\`\`bash
   # Check recent logs for SQL injection patterns
   grep -i "union\|select\|drop\|insert\|update\|delete" /var/log/app/*.log | tail -50
   
   # Check database connections
   netstat -an | grep :5432  # PostgreSQL
   netstat -an | grep :3306  # MySQL
   \`\`\`

3. **Immediate Containment**
   - Block source IP if identified: `iptables -A INPUT -s <IP> -j DROP`
   - Enable WAF strict mode if available
   - Consider temporary API rate limiting

#### Investigation Phase (5-30 minutes)
1. **Evidence Collection**
   \`\`\`bash
   # Extract relevant logs
   grep -A 5 -B 5 "<suspicious_pattern>" /var/log/app/*.log > /tmp/sqli_evidence.log
   
   # Check database logs
   tail -100 /var/log/postgresql/postgresql.log
   
   # Review application logs
   docker logs <app_container> | grep -i error | tail -50
   \`\`\`

2. **Impact Assessment**
   - Check database integrity
   - Review recent database changes
   - Verify data hasn't been exfiltrated
   - Check for privilege escalation

3. **Technical Analysis**
   \`\`\`sql
   -- Check for suspicious database activity
   SELECT * FROM pg_stat_activity WHERE state = 'active';
   
   -- Review recent queries (if query logging enabled)
   SELECT query, query_start, state FROM pg_stat_activity 
   WHERE query NOT LIKE '%pg_stat_activity%';
   \`\`\`

#### Containment & Eradication (30-60 minutes)
1. **Secure the Application**
   - Deploy emergency patch if vulnerability identified
   - Update input validation rules
   - Enable prepared statements verification

2. **Database Security**
   \`\`\`sql
   -- Revoke unnecessary permissions
   REVOKE ALL ON SCHEMA public FROM public;
   
   -- Check for new users/roles
   SELECT * FROM pg_roles WHERE rolcreatedb = true OR rolcreaterole = true;
   
   -- Reset database passwords if compromised
   ALTER USER app_user WITH PASSWORD '<new_secure_password>';
   \`\`\`

3. **Infrastructure Hardening**
   - Update WAF rules
   - Implement additional input validation
   - Enable database query monitoring

#### Recovery & Monitoring
1. **System Restoration**
   - Verify application functionality
   - Test database connectivity
   - Validate data integrity

2. **Enhanced Monitoring**
   \`\`\`javascript
   // Add enhanced SQL injection monitoring
   const suspiciousPatterns = [
     /union\s+select/i,
     /drop\s+table/i,
     /insert\s+into/i,
     /'.*or.*'.*=/i
   ];
   \`\`\`

---

### 🚨 XSS Attempt

**Severity:** CRITICAL  
**Response Time:** Immediate (< 5 minutes)  
**Escalation:** Security team + Frontend lead

#### Immediate Actions (0-5 minutes)
1. **Alert Acknowledgment**
   - Create incident: `SEC-XSS-YYYY-MM-DD-XXX`
   - Check if payload was executed
   - Identify affected endpoints

2. **Quick Assessment**
   \`\`\`bash
   # Check for XSS patterns in logs
   grep -i "script\|javascript\|onerror\|onload" /var/log/nginx/access.log | tail -20
   
   # Check CSP violations
   grep "csp-violation" /var/log/app/*.log | tail -10
   \`\`\`

3. **Immediate Containment**
   - Enable strict CSP if not already active
   - Block malicious requests at WAF level
   - Consider temporary input sanitization

#### Investigation Phase (5-30 minutes)
1. **Payload Analysis**
   \`\`\`javascript
   // Decode and analyze XSS payload
   const payload = decodeURIComponent("<detected_payload>");
   console.log("Decoded payload:", payload);
   
   // Check for data exfiltration attempts
   const dataExfilPattern = /document\.cookie|localStorage|sessionStorage/i;
   \`\`\`

2. **Impact Assessment**
   - Check if user sessions were compromised
   - Review for data exfiltration
   - Identify affected user accounts

3. **Vulnerability Assessment**
   \`\`\`bash
   # Check application for XSS vulnerabilities
   grep -r "innerHTML\|outerHTML" /app/src/ | grep -v "sanitize"
   
   # Review template rendering
   find /app/templates -name "*.html" -exec grep -l "{{.*}}" {} \;
   \`\`\`

#### Containment & Eradication
1. **Application Security**
   \`\`\`javascript
   // Implement/verify output encoding
   function sanitizeOutput(input) {
     return input
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#x27;');
   }
   \`\`\`

2. **CSP Hardening**
   \`\`\`javascript
   // Strict CSP policy
   const cspPolicy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
   \`\`\`

---

## High Severity Playbooks

### ⚠️ Unauthorized Access Attempt

**Severity:** HIGH  
**Response Time:** < 15 minutes  
**Escalation:** Security team + System admin

#### Immediate Actions (0-15 minutes)
1. **Alert Triage**
   - Identify access attempt details
   - Check if access was successful
   - Determine affected resources

2. **Quick Containment**
   \`\`\`bash
   # Block suspicious IP
   sudo ufw deny from <suspicious_ip>
   
   # Check active sessions
   who -u
   last -n 20
   
   # Review authentication logs
   grep "authentication failure" /var/log/auth.log | tail -10
   \`\`\`

#### Investigation Phase (15-45 minutes)
1. **Access Pattern Analysis**
   \`\`\`bash
   # Analyze login attempts
   grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -nr
   
   # Check for successful logins from suspicious IPs
   grep "Accepted password" /var/log/auth.log | grep "<suspicious_ip>"
   
   # Review sudo usage
   grep "sudo:" /var/log/auth.log | tail -20
   \`\`\`

2. **System Integrity Check**
   \`\`\`bash
   # Check for new users
   grep "new user" /var/log/auth.log
   
   # Verify system files
   sudo aide --check
   
   # Check running processes
   ps aux | grep -v "^\[" | sort
   \`\`\`

#### Containment & Recovery
1. **Access Control**
   \`\`\`bash
   # Disable compromised accounts
   sudo usermod -L <username>
   
   # Force password reset
   sudo passwd -e <username>
   
   # Review SSH keys
   cat ~/.ssh/authorized_keys
   \`\`\`

2. **System Hardening**
   \`\`\`bash
   # Update fail2ban rules
   sudo fail2ban-client set sshd bantime 3600
   
   # Enable two-factor authentication
   sudo apt-get install libpam-google-authenticator
   \`\`\`

---

### ⚠️ Brute Force Attack

**Severity:** HIGH  
**Response Time:** < 10 minutes  
**Escalation:** Security team

#### Immediate Actions (0-10 minutes)
1. **Attack Assessment**
   \`\`\`bash
   # Identify attack source
   grep "authentication failure" /var/log/auth.log | tail -50 | awk '{print $11}' | sort | uniq -c | sort -nr
   
   # Check attack intensity
   grep "authentication failure" /var/log/auth.log | grep "$(date '+%b %d')" | wc -l
   \`\`\`

2. **Immediate Blocking**
   \`\`\`bash
   # Block attacking IPs
   for ip in $(grep "authentication failure" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -nr | head -5 | awk '{print $2}'); do
     sudo ufw deny from $ip
   done
   \`\`\`

#### Investigation & Response
1. **Pattern Analysis**
   \`\`\`bash
   # Analyze attack patterns
   grep "authentication failure" /var/log/auth.log | awk '{print $9, $11}' | sort | uniq -c | sort -nr
   
   # Check targeted accounts
   grep "authentication failure" /var/log/auth.log | awk '{print $9}' | sort | uniq -c | sort -nr
   \`\`\`

2. **Enhanced Protection**
   \`\`\`bash
   # Configure fail2ban
   sudo tee /etc/fail2ban/jail.local << EOF
   [sshd]
   enabled = true
   port = ssh
   filter = sshd
   logpath = /var/log/auth.log
   maxretry = 3
   bantime = 3600
   EOF
   
   sudo systemctl restart fail2ban
   \`\`\`

---

## Medium Severity Playbooks

### ⚡ Rate Limit Exceeded

**Severity:** MEDIUM  
**Response Time:** < 30 minutes  
**Escalation:** Engineering team

#### Investigation Process
1. **Traffic Analysis**
   \`\`\`bash
   # Analyze request patterns
   awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -20
   
   # Check request rates
   grep "$(date '+%d/%b/%Y:%H')" /var/log/nginx/access.log | wc -l
   \`\`\`

2. **Legitimate vs Malicious Traffic**
   \`\`\`bash
   # Check user agents
   awk '{print $12}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
   
   # Analyze request endpoints
   awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -20
   \`\`\`

#### Response Actions
1. **Rate Limiting Adjustment**
   ```nginx
   # Update nginx rate limiting
   limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
   limit_req zone=api burst=20 nodelay;
   \`\`\`

2. **Monitoring Enhancement**
   \`\`\`javascript
   // Enhanced rate limit monitoring
   const rateLimitConfig = {
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: "Too many requests from this IP"
   };
   \`\`\`

---

### ⚡ Failed Authentication Attempts

**Severity:** MEDIUM  
**Response Time:** &lt; 30 minutes  
**Escalation:** Security team if > 50 attempts

#### Investigation Steps
1. **Attempt Analysis**
   \`\`\`bash
   # Count failed attempts by IP
   grep "authentication failure" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -nr
   
   # Check time distribution
   grep "authentication failure" /var/log/auth.log | awk '{print $1, $2, $3}' | uniq -c
   \`\`\`

2. **User Impact Assessment**
   \`\`\`bash
   # Check affected users
   grep "authentication failure" /var/log/auth.log | awk '{print $9}' | sort | uniq -c | sort -nr
   
   # Verify legitimate user lockouts
   grep "account locked" /var/log/auth.log
   \`\`\`

#### Response Actions
1. **Account Protection**
   \`\`\`bash
   # Implement account lockout policy
   sudo tee -a /etc/pam.d/common-auth &lt;&lt; EOF
   auth required pam_tally2.so deny=5 unlock_time=300
   EOF
   \`\`\`

2. **Monitoring Enhancement**
   \`\`\`javascript
   // Enhanced authentication monitoring
   const authConfig = {
     maxFailedAttempts: 5,
     lockoutDuration: 300000, // 5 minutes
     alertThreshold: 10
   };
   \`\`\`

---

## Low Severity Playbooks

### ℹ️ CSP Violation

**Severity:** LOW  
**Response Time:** &lt; 2 hours  
**Escalation:** Frontend team

#### Investigation Process
1. **Violation Analysis**
   \`\`\`javascript
   // Analyze CSP violation reports
   const violation = JSON.parse(cspReport);
   console.log("Violated directive:", violation.violatedDirective);
   console.log("Blocked URI:", violation.blockedURI);
   console.log("Source file:", violation.sourceFile);
   \`\`\`

2. **Impact Assessment**
   - Determine if violation indicates XSS attempt
   - Check for legitimate resource blocking
   - Review application functionality impact

#### Response Actions
1. **CSP Policy Review**
   \`\`\`javascript
   // Update CSP policy if needed
   const updatedCSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://trusted-cdn.com;";
   \`\`\`

2. **Code Review**
   \`\`\`bash
   # Check for inline scripts/styles
   grep -r "onclick\|onload\|onerror" /app/src/
   find /app/src -name "*.html" -exec grep -l "style=" {} \;
   \`\`\`

---

## Escalation Matrix

### Immediate Escalation (&lt; 5 minutes)
- **Critical Severity Events**
- **Data breach indicators**
- **System compromise evidence**
- **Active attacks in progress**

**Contacts:**
- Security Team Lead: security-lead@company.com
- CTO: cto@company.com
- On-call Engineer: +1-XXX-XXX-XXXX

### Standard Escalation (&lt; 30 minutes)
- **High Severity Events**
- **Repeated medium severity events**
- **Service disruption potential**

**Contacts:**
- Engineering Manager: eng-manager@company.com
- DevOps Team: devops@company.com

### Routine Escalation (&lt; 2 hours)
- **Medium/Low Severity Events**
- **Policy violations**
- **Configuration issues**

**Contacts:**
- Development Team: dev-team@company.com
- Security Team: security@company.com

---

## Communication Templates

### Critical Incident Notification
\`\`\`
🚨 CRITICAL SECURITY INCIDENT

Incident ID: SEC-XXX-YYYY-MM-DD-XXX
Severity: CRITICAL
Type: [SQL Injection/XSS/Data Breach/etc.]
Status: INVESTIGATING

Summary: [Brief description of the incident]
Impact: [Affected systems/users/data]
Actions Taken: [Immediate containment measures]

Incident Commander: [Name]
Next Update: [Time]

War Room: [Slack channel/Zoom link]
\`\`\`

### Status Update Template
\`\`\`
📊 INCIDENT UPDATE

Incident ID: SEC-XXX-YYYY-MM-DD-XXX
Status: [INVESTIGATING/CONTAINED/RESOLVED]
Time: [Current timestamp]

Progress:
✅ [Completed actions]
🔄 [In progress actions]
⏳ [Pending actions]

Impact Update: [Current impact assessment]
ETA to Resolution: [Estimated time]

Next Update: [Time]
\`\`\`

### Resolution Notification
\`\`\`
✅ INCIDENT RESOLVED

Incident ID: SEC-XXX-YYYY-MM-DD-XXX
Resolution Time: [Timestamp]
Duration: [Total incident duration]

Root Cause: [Brief explanation]
Resolution: [Actions taken to resolve]
Prevention: [Measures to prevent recurrence]

Post-Mortem: [Scheduled date/time]
Documentation: [Link to incident report]
\`\`\`

---

## Tools and Resources

### Monitoring Commands
\`\`\`bash
# Real-time log monitoring
tail -f /var/log/auth.log | grep --color=always "FAILED\|ERROR\|CRITICAL"

# Security event dashboard
curl -s http://localhost:3000/api/security/dashboard | jq '.'

# Active connections
netstat -tulpn | grep LISTEN

# System resource usage
htop
iotop
\`\`\`

### Investigation Tools
\`\`\`bash
# Log analysis
grep -E "(ERROR|WARN|CRITICAL)" /var/log/app/*.log | tail -50

# Network analysis
tcpdump -i eth0 -n -c 100

# File integrity
find /etc -type f -mtime -1  # Files modified in last 24 hours

# Process analysis
ps aux --sort=-%cpu | head -20
\`\`\`

### Recovery Scripts
\`\`\`bash
#!/bin/bash
# Emergency security lockdown script
echo "🚨 Initiating emergency security lockdown..."

# Block all non-essential traffic
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw --force enable

# Stop non-critical services
sudo systemctl stop nginx
sudo systemctl stop apache2

# Create incident log
echo "$(date): Emergency lockdown initiated" >> /var/log/security-incidents.log

echo "✅ Emergency lockdown complete"
\`\`\`

---

## Training and Preparedness

### Regular Drills
- **Monthly:** Tabletop exercises for different incident types
- **Quarterly:** Full incident response simulation
- **Annually:** Red team exercises

### Documentation Updates
- Review playbooks after each incident
- Update contact information quarterly
- Test communication channels monthly

### Team Training
- New team member incident response training
- Regular security awareness sessions
- Tool-specific training for monitoring systems

---

## Metrics and KPIs

### Response Time Metrics
- **Mean Time to Detection (MTTD):** &lt; 5 minutes for critical
- **Mean Time to Response (MTTR):** &lt; 15 minutes for critical
- **Mean Time to Resolution (MTTR):** &lt; 2 hours for critical

### Quality Metrics
- **False Positive Rate:** &lt; 5%
- **Incident Escalation Rate:** &lt; 20%
- **Post-Incident Action Completion:** > 95%

### Continuous Improvement
- Monthly incident review meetings
- Quarterly playbook updates
- Annual incident response assessment
\`\`\`

Now let me create specific runbooks for automated responses:
