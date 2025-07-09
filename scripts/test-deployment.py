#!/usr/bin/env python3
"""
CoinWayFinder Deployment Test Suite
Python-based testing for comprehensive application validation
"""

import os
import sys
import time
import json
import requests
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from urllib.parse import urljoin

@dataclass
class TestResult:
    name: str
    status: str  # 'pass', 'fail', 'warning'
    message: str
    duration: float
    details: Optional[Dict] = None

class DeploymentTester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.results: List[TestResult] = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'CoinWayFinder-TestSuite/1.0',
            'Accept': 'application/json'
        })

    def make_request(self, path: str, method: str = 'GET', **kwargs) -> Tuple[int, Dict]:
        """Make HTTP request and return status code and response data"""
        url = urljoin(self.base_url, path)
        
        try:
            response = self.session.request(method, url, timeout=30, **kwargs)
            
            # Try to parse JSON, fallback to text
            try:
                data = response.json()
            except:
                data = {'text': response.text, 'content_length': len(response.text)}
            
            return response.status_code, data
            
        except requests.exceptions.RequestException as e:
            return 0, {'error': str(e)}

    def run_test(self, name: str, test_func) -> TestResult:
        """Run a single test and record the result"""
        start_time = time.time()
        print(f"🧪 Testing: {name}")
        
        try:
            test_func()
            duration = time.time() - start_time
            result = TestResult(
                name=name,
                status='pass',
                message='Test passed successfully',
                duration=duration
            )
            print(f"✅ {name} - PASSED ({duration:.2f}s)")
            
        except Exception as e:
            duration = time.time() - start_time
            result = TestResult(
                name=name,
                status='fail',
                message=str(e),
                duration=duration
            )
            print(f"❌ {name} - FAILED ({duration:.2f}s): {str(e)}")
        
        self.results.append(result)
        return result

    def test_health_endpoint(self):
        """Test the health endpoint"""
        def test():
            status, data = self.make_request('/api/health')
            
            if status != 200:
                raise Exception(f"Expected 200, got {status}")
            
            if not isinstance(data, dict) or 'status' not in data:
                raise Exception("Health response missing status field")
            
            print(f"   📊 Status: {data.get('status', 'unknown')}")
            print(f"   🌍 Environment: {data.get('environment', 'unknown')}")
            print(f"   ⏱️ Uptime: {data.get('uptime', 0)}s")
            
        return self.run_test('Health Endpoint', test)

    def test_comprehensive_endpoint(self):
        """Test the comprehensive test endpoint"""
        def test():
            status, data = self.make_request('/api/test')
            
            if status not in [200, 500]:
                raise Exception(f"Expected 200 or 500, got {status}")
            
            if not isinstance(data, dict) or 'tests' not in data:
                raise Exception("Test response missing tests array")
            
            tests = data.get('tests', [])
            print(f"   📊 Found {len(tests)} component tests")
            print(f"   📈 Overall status: {data.get('status', 'unknown')}")
            
            for test in tests:
                icon = "✅" if test.get('status') == 'healthy' else "⚠️" if test.get('status') == 'warning' else "❌"
                print(f"   {icon} {test.get('name', 'Unknown')}: {test.get('message', 'No message')}")
            
            if 'summary' in data:
                summary = data['summary']
                print(f"   📊 Summary: {summary.get('healthy', 0)}/{summary.get('total', 0)} healthy")
                
        return self.run_test('Comprehensive Test Endpoint', test)

    def test_static_pages(self) -> List[TestResult]:
        """Test all static pages"""
        pages = [
            ('/', 'Home Page'),
            ('/dashboard', 'Dashboard'),
            ('/bots', 'Bots Page'),
            ('/subscription', 'Subscription Page'),
            ('/api-docs', 'API Documentation'),
            ('/news', 'News Page'),
            ('/integrations', 'Integrations Page'),
            ('/profile', 'Profile Page')
        ]
        
        results = []
        
        for path, name in pages:
            def test():
                status, data = self.make_request(path)
                
                if status != 200:
                    raise Exception(f"Expected 200, got {status}")
                
                content = data.get('text', '') if 'text' in data else str(data)
                
                if '<!DOCTYPE html>' not in content and '<html' not in content:
                    raise Exception("Response does not appear to be HTML")
                
                print(f"   📄 Content length: {data.get('content_length', len(content))} characters")
            
            result = self.run_test(f'Static Page: {name}', test)
            results.append(result)
        
        return results

    def test_api_endpoints(self) -> List[TestResult]:
        """Test API endpoints"""
        endpoints = [
            {
                'path': '/api/auth/signin',
                'method': 'POST',
                'expect_status': [400, 401, 422],
                'json': {'email': 'test@example.com', 'password': 'testpass'}
            },
            {
                'path': '/api/crypto/prices',
                'method': 'GET',
                'expect_status': [200, 401, 503]
            },
            {
                'path': '/api/crypto/trends',
                'method': 'GET',
                'expect_status': [200, 401, 503]
            },
            {
                'path': '/api/bots',
                'method': 'GET',
                'expect_status': [200, 401]
            },
            {
                'path': '/api/subscription',
                'method': 'GET',
                'expect_status': [200, 401]
            },
            {
                'path': '/api/news',
                'method': 'GET',
                'expect_status': [200, 401, 503]
            },
            {
                'path': '/api/whales',
                'method': 'GET',
                'expect_status': [200, 401, 503]
            }
        ]
        
        results = []
        
        for endpoint in endpoints:
            def test():
                kwargs = {}
                if 'json' in endpoint:
                    kwargs['json'] = endpoint['json']
                
                status, data = self.make_request(
                    endpoint['path'], 
                    endpoint['method'], 
                    **kwargs
                )
                
                if status not in endpoint['expect_status']:
                    raise Exception(f"Expected {endpoint['expect_status']}, got {status}")
                
                print(f"   📡 Status: {status} (expected)")
                
                if isinstance(data, dict) and 'message' in data:
                    print(f"   💬 Message: {data['message']}")
            
            result = self.run_test(f"API Endpoint: {endpoint['path']}", test)
            results.append(result)
        
        return results

    def test_performance(self) -> List[TestResult]:
        """Test performance of key endpoints"""
        performance_tests = [
            {'name': 'Home Page Load Time', 'path': '/', 'max_time': 3.0},
            {'name': 'Dashboard Load Time', 'path': '/dashboard', 'max_time': 3.0},
            {'name': 'API Health Response', 'path': '/api/health', 'max_time': 1.0},
            {'name': 'API Test Response', 'path': '/api/test', 'max_time': 5.0}
        ]
        
        results = []
        
        for test_config in performance_tests:
            def test():
                start_time = time.time()
                status, data = self.make_request(test_config['path'])
                duration = time.time() - start_time
                
                if status not in [200, 500]:
                    raise Exception(f"Request failed with status {status}")
                
                if duration > test_config['max_time']:
                    print(f"   ⚠️ Slow response: {duration:.2f}s (expected <{test_config['max_time']}s)")
                else:
                    print(f"   ⚡ Good response time: {duration:.2f}s")
            
            result = self.run_test(f"Performance: {test_config['name']}", test)
            results.append(result)
        
        return results

    def run_all_tests(self) -> List[TestResult]:
        """Run all test categories"""
        print(f"🌐 Testing application at: {self.base_url}")
        print("=" * 50)
        
        # Run all test categories
        self.test_health_endpoint()
        self.test_comprehensive_endpoint()
        self.test_static_pages()
        self.test_api_endpoints()
        self.test_performance()
        
        return self.results

    def print_results(self):
        """Print detailed test results"""
        print("\n" + "=" * 50)
        print("📈 DETAILED TEST RESULTS")
        print("=" * 50)
        
        passed = len([r for r in self.results if r.status == 'pass'])
        failed = len([r for r in self.results if r.status == 'fail'])
        warnings = len([r for r in self.results if r.status == 'warning'])
        total = len(self.results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"⚠️ Warnings: {warnings}/{total}")
        print(f"❌ Failed: {failed}/{total}")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if result.status == 'fail':
                    print(f"   • {result.name}: {result.message}")
        
        if warnings > 0:
            print("\n⚠️ WARNINGS:")
            for result in self.results:
                if result.status == 'warning':
                    print(f"   • {result.name}: {result.message}")
        
        avg_duration = sum(r.duration for r in self.results) / total if total > 0 else 0
        print(f"\n⏱️ Average response time: {avg_duration:.2f}s")
        
        slow_tests = [r for r in self.results if r.duration > 2.0]
        if slow_tests:
            print(f"\n🐌 Slow tests (>2s):")
            for test in slow_tests:
                print(f"   • {test.name}: {test.duration:.2f}s")
        
        print("\n" + "=" * 50)
        
        if failed == 0 and warnings == 0:
            print("🎉 All tests passed! Your application is working perfectly.")
        elif failed == 0:
            print("✅ All tests passed with some warnings. Review above.")
        else:
            print(f"⚠️ {failed} test(s) failed. Please review the issues above.")
        
        print("\n💡 Next Steps:")
        if failed > 0:
            print("   1. Fix the failed tests")
            print("   2. Check environment variables")
            print("   3. Verify database connections")
        print("   • Visit /api/health for basic status")
        print("   • Visit /api/test for detailed component status")
        print("   • Check Vercel deployment logs for errors")

def main():
    """Main execution function"""
    # Determine base URL
    base_url = (
        f"https://{os.environ['VERCEL_URL']}" if os.environ.get('VERCEL_URL')
        else os.environ.get('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
    )
    
    # Handle command line arguments
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    print("🚀 Starting CoinWayFinder Python Test Suite")
    print("=" * 50)
    
    # Initialize and run tests
    tester = DeploymentTester(base_url)
    
    try:
        results = tester.run_all_tests()
        tester.print_results()
        
        # Exit with appropriate code
        failed = len([r for r in results if r.status == 'fail'])
        warnings = len([r for r in results if r.status == 'warning'])
        
        if failed > 0:
            print("\n🚨 Tests failed! Please fix the issues above.")
            sys.exit(1)
        elif warnings > 0:
            print("\n⚠️ Tests passed with warnings. Review above.")
            sys.exit(0)
        else:
            print("\n🎉 All tests passed successfully!")
            sys.exit(0)
            
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
