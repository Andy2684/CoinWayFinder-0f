#!/usr/bin/env python3

import requests
import json
import time
import sys
import os
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from urllib.parse import urljoin

@dataclass
class TestResult:
    name: str
    status: str  # 'pass', 'fail', 'warning'
    message: str
    duration: float
    details: Optional[Dict[str, Any]] = None

class DeploymentTester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.results: List[TestResult] = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'CoinWayFinder-DeploymentTest-Python/1.0',
            'Accept': 'application/json'
        })

    def make_request(self, path: str, method: str = 'GET', **kwargs) -> requests.Response:
        """Make HTTP request with timeout and error handling"""
        url = urljoin(self.base_url, path)
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                timeout=10,
                **kwargs
            )
            return response
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")

    def run_test(self, name: str, test_func) -> TestResult:
        """Run a single test and track results"""
        print(f"🧪 Testing: {name}")
        start_time = time.time()
        
        try:
            result = test_func()
            duration = time.time() - start_time
            
            test_result = TestResult(
                name=name,
                status=result.get('status', 'pass'),
                message=result.get('message', 'Test completed successfully'),
                duration=duration,
                details=result.get('details')
            )
            
            icon = "✅" if test_result.status == 'pass' else "⚠️" if test_result.status == 'warning' else "❌"
            print(f"{icon} {name} ({duration:.2f}s)")
            
            self.results.append(test_result)
            return test_result
            
        except Exception as error:
            duration = time.time() - start_time
            
            test_result = TestResult(
                name=name,
                status='fail',
                message=str(error),
                duration=duration,
                details={'error': str(error)}
            )
            
            print(f"❌ {name} ({duration:.2f}s): {str(error)}")
            self.results.append(test_result)
            return test_result

    def test_health_endpoint(self) -> Dict[str, Any]:
        """Test the health endpoint"""
        response = self.make_request('/api/health')
        
        if response.status_code != 200:
            raise Exception(f"Expected 200, got {response.status_code}")
        
        try:
            data = response.json()
        except json.JSONDecodeError:
            raise Exception("Health endpoint returned invalid JSON")
        
        if 'status' not in data:
            raise Exception("Health response missing status field")
        
        return {
            'status': 'pass',
            'message': f"Server is {data.get('status', 'unknown')}",
            'details': data
        }

    def test_system_endpoint(self) -> Dict[str, Any]:
        """Test the system test endpoint"""
        response = self.make_request('/api/test')
        
        if response.status_code not in [200, 500]:
            raise Exception(f"Expected 200 or 500, got {response.status_code}")
        
        try:
            data = response.json()
        except json.JSONDecodeError:
            raise Exception("System test endpoint returned invalid JSON")
        
        if 'tests' not in data or not isinstance(data['tests'], list):
            raise Exception("Test response missing tests array")
        
        healthy_tests = len([t for t in data['tests'] if t.get('status') == 'healthy'])
        total_tests = len(data['tests'])
        
        if healthy_tests == total_tests:
            status = 'pass'
        elif healthy_tests > 0:
            status = 'warning'
        else:
            status = 'fail'
        
        return {
            'status': status,
            'message': f"{healthy_tests}/{total_tests} system components healthy",
            'details': data
        }

    def test_frontend_pages(self) -> List[TestResult]:
        """Test frontend page loading"""
        pages = [
            {'path': '/', 'name': 'Home Page'},
            {'path': '/dashboard', 'name': 'Dashboard'},
            {'path': '/bots', 'name': 'Bots Page'},
            {'path': '/subscription', 'name': 'Subscription Page'},
            {'path': '/api-docs', 'name': 'API Documentation'},
        ]
        
        results = []
        
        for page in pages:
            def test_page():
                response = self.make_request(page['path'])
                
                if response.status_code != 200:
                    raise Exception(f"Expected 200, got {response.status_code}")
                
                content = response.text
                
                if '<!DOCTYPE html>' not in content and '<html' not in content:
                    raise Exception("Response does not appear to be HTML")
                
                return {
                    'status': 'pass',
                    'message': 'Page loads correctly',
                    'details': {
                        'status_code': response.status_code,
                        'content_length': len(content)
                    }
                }
            
            result = self.run_test(page['name'], test_page)
            results.append(result)
        
        return results

    def test_api_endpoints(self) -> List[TestResult]:
        """Test API endpoint responses"""
        endpoints = [
            {
                'path': '/api/auth/signin',
                'method': 'POST',
                'json': {'email': 'test@example.com', 'password': 'testpass'},
                'expected_statuses': [400, 401, 422],
                'name': 'Auth Signin API'
            },
            {
                'path': '/api/crypto/prices',
                'method': 'GET',
                'expected_statuses': [200, 401, 503],
                'name': 'Crypto Prices API'
            },
            {
                'path': '/api/bots',
                'method': 'GET',
                'expected_statuses': [200, 401],
                'name': 'Bots API'
            },
            {
                'path': '/api/subscription',
                'method': 'GET',
                'expected_statuses': [200, 401],
                'name': 'Subscription API'
            }
        ]
        
        results = []
        
        for endpoint in endpoints:
            def test_endpoint():
                kwargs = {}
                if 'json' in endpoint:
                    kwargs['json'] = endpoint['json']
                
                response = self.make_request(
                    endpoint['path'],
                    method=endpoint['method'],
                    **kwargs
                )
                
                if response.status_code not in endpoint['expected_statuses']:
                    expected = ' or '.join(map(str, endpoint['expected_statuses']))
                    raise Exception(f"Expected {expected}, got {response.status_code}")
                
                return {
                    'status': 'pass',
                    'message': f"API responds correctly ({response.status_code})",
                    'details': {
                        'status_code': response.status_code,
                        'expected_statuses': endpoint['expected_statuses']
                    }
                }
            
            result = self.run_test(endpoint['name'], test_endpoint)
            results.append(result)
        
        return results

    def run_all_tests(self) -> List[TestResult]:
        """Run all deployment tests"""
        print(f"🌐 Testing deployment at: {self.base_url}")
        print("=" * 50)
        
        # Run test categories
        self.run_test('Health Endpoint', self.test_health_endpoint)
        self.run_test('System Test Endpoint', self.test_system_endpoint)
        self.test_frontend_pages()
        self.test_api_endpoints()
        
        return self.results

    def print_results(self):
        """Print test results summary"""
        print("\n" + "=" * 50)
        print("📊 DEPLOYMENT TEST RESULTS")
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
        
        avg_duration = sum(r.duration for r in self.results) / total
        print(f"\n⏱️ Average response time: {avg_duration:.2f}s")
        
        print("\n" + "=" * 50)
        
        if failed == 0 and warnings == 0:
            print("🎉 All tests passed! Deployment is healthy.")
        elif failed == 0:
            print("✅ Deployment is functional with some warnings.")
        else:
            print("🚨 Deployment has critical issues that need attention.")

def main():
    print("🚀 CoinWayFinder Python Deployment Tester")
    print("=" * 50)
    
    # Get base URL from command line or environment
    base_url = (
        sys.argv[1] if len(sys.argv) > 1 else
        f"https://{os.environ['VERCEL_URL']}" if os.environ.get('VERCEL_URL') else
        os.environ.get('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
    )
    
    print(f"🎯 Target: {base_url}")
    print("🔍 Running deployment tests...\n")
    
    try:
        tester = DeploymentTester(base_url)
        results = tester.run_all_tests()
        
        tester.print_results()
        
        # Exit with appropriate code
        failed = len([r for r in results if r.status == 'fail'])
        warnings = len([r for r in results if r.status == 'warning'])
        
        if failed > 0:
            print("\n🚨 Deployment tests failed!")
            sys.exit(1)
        elif warnings > 0:
            print("\n⚠️ Deployment tests passed with warnings.")
            sys.exit(0)
        else:
            print("\n🎉 All deployment tests passed!")
            sys.exit(0)
            
    except Exception as error:
        print(f"❌ Test execution failed: {error}")
        sys.exit(1)

if __name__ == "__main__":
    main()
