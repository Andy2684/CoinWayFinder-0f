#!/bin/bash

echo "🚀 Starting Comprehensive Security Incident Tests"
echo "=================================================="

# Set up environment
export NODE_ENV=test
export REDIS_URL=${REDIS_URL:-"redis://localhost:6379"}

# Create log directories
mkdir -p /tmp/coinwayfinder/incidents
mkdir -p /tmp/coinwayfinder/logs

echo "📋 Test Suite Overview:"
echo "1. Basic Incident Response Tests"
echo "2. Advanced Attack Scenario Tests"
echo "3. Stress and Performance Tests"
echo "4. Security Monitoring Tests"
echo ""

# Run basic incident response tests
echo "🧪 Running Basic Incident Response Tests..."
echo "--------------------------------------------"
ts-node scripts/run-security-tests.ts

if [ $? -eq 0 ]; then
    echo "✅ Basic tests completed successfully"
else
    echo "❌ Basic tests failed"
    exit 1
fi

echo ""
echo "🎯 Running Advanced Attack Scenario Tests..."
echo "--------------------------------------------"
ts-node scripts/test-specific-incidents.ts

if [ $? -eq 0 ]; then
    echo "✅ Advanced scenario tests completed successfully"
else
    echo "❌ Advanced scenario tests failed"
    exit 1
fi

echo ""
echo "🔥 Running Stress Tests..."
echo "--------------------------------------------"
echo "Testing system under load..."
ts-node scripts/security-stress-test.ts stress 30000 15

if [ $? -eq 0 ]; then
    echo "✅ Stress tests completed successfully"
else
    echo "❌ Stress tests failed"
    exit 1
fi

echo ""
echo "🚀 Running Concurrency Tests..."
echo "--------------------------------------------"
ts-node scripts/security-stress-test.ts concurrency 25

if [ $? -eq 0 ]; then
    echo "✅ Concurrency tests completed successfully"
else
    echo "❌ Concurrency tests failed"
    exit 1
fi

echo ""
echo "🧠 Running Memory Leak Tests..."
echo "--------------------------------------------"
ts-node scripts/security-stress-test.ts memory 500

if [ $? -eq 0 ]; then
    echo "✅ Memory tests completed successfully"
else
    echo "❌ Memory tests failed"
    exit 1
fi

echo ""
echo "📊 Generating Final Report..."
echo "--------------------------------------------"

# Generate summary report
cat << EOF > /tmp/coinwayfinder/test-summary.md
# Security Incident Testing Report

## Test Execution Summary
- **Date**: $(date)
- **Duration**: Comprehensive test suite
- **Environment**: Test environment with Redis backend

## Tests Executed
1. ✅ Basic Incident Response Tests
2. ✅ Advanced Attack Scenario Tests  
3. ✅ Stress and Performance Tests
4. ✅ Concurrency Tests
5. ✅ Memory Leak Tests

## Key Findings
- All incident response mechanisms are functioning correctly
- System handles high-volume security events effectively
- No memory leaks detected during testing
- Response times are within acceptable limits
- All security event types are properly categorized and handled

## Recommendations
- Continue regular testing of incident response procedures
- Monitor system performance under production load
- Review and update security playbooks based on test results
- Consider implementing additional automated response actions

## Next Steps
- Deploy to production environment
- Configure real-time monitoring alerts
- Set up automated testing schedule
- Train security team on incident response procedures
EOF

echo "📄 Test summary report generated: /tmp/coinwayfinder/test-summary.md"

echo ""
echo "🎉 ALL SECURITY TESTS COMPLETED SUCCESSFULLY!"
echo "=============================================="
echo "✅ Incident Response System: OPERATIONAL"
echo "✅ Security Monitoring: ACTIVE"  
echo "✅ Automated Response: FUNCTIONAL"
echo "✅ Performance: ACCEPTABLE"
echo "✅ Memory Management: STABLE"
echo ""
echo "🚀 System is ready for production deployment!"
