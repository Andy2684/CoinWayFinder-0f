import requests
import json
import time
import sys
import os
from urllib.parse import urljoin

class DeploymentTester:
    def __init__(self, base_url):
        self.base_url = base_url.rstrip('/')
        self.results = []
        self.session = requests.Session()
        self.session.timeout = 10

    def run_test(self, name, test_func):
        start_time = time.time()
        print(f"🧪 Testing: {name}")
        
        try:
            test_func()
            duration = (time.time() - start_time) * 1000
            print(f"✅ {name} - PASSED ({duration:.0f}ms)")
            self.results.append({"name": name, "status": "pass", "duration": duration})
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            print(f"❌ {name} - FAILED ({duration:.0f}ms): {str(e)}")
            self.results.append({"name": name, "status": "fail", "duration": duration, "error": str(e)})

    def test_health_endpoint(self):
        def test():
            response = self.session.get(f"{self.base_url}/api/health")
            if response.status_code != 200:
                raise Exception(f"Expected 200, got {response.status_code}")
            
            data = response.json()
            if "status" not in data:
                raise Exception("Health response missing status field")
            
            if data["status"] not in ["healthy", "warning"]:
                raise Exception(f"Unexpected health status: {data['status']}")
        
        self.run_test("Health Endpoint", test)

    def test_comprehensive_endpoint(self):
        def test():
            response = self.session.get(f"{self.base_url}/api/test")
            if response.status_code not in [200, 500]:
                raise Exception(f"Expected 200 or 500, got {response.status_code}")
            
            data = response.json()
            if "tests" not in data or not isinstance(data["tests"], list):
                raise Exception("Test response missing tests array")
            
            print(f"   📊 Found {len(data['tests'])} component tests")
            for test in data["tests"]:
                icon = "✅" if test["status"] == "healthy" else "⚠️" if test["status"] == "warning" else "❌"
                print(f"   {icon} {test['name']}: {test['message']}")
        
        self.run_test("Comprehensive Test Endpoint", test)

    def test_static_pages(self):
        pages = ["/", "/dashboard", "/bots", "/subscription", "/api-docs"]
        
        for page in pages:
            def test():
                response = self.session.get(f"{self.base_url}{page}")
                if response.status_code != 200:
                    raise Exception(f"Expected 200, got {response.status_code}")
                
                if "<!DOCTYPE html>" not in response.text and "<html" not in response.text:
                    raise Exception("Response does not appear to be HTML")
            
            self.run_test(f"Page: {page}", test)

    def test_api_endpoints(self):
        endpoints = [
            {"path": "/api/auth/signin", "method": "POST", "expect_status": [400, 401]},
            {"path": "/api/crypto/prices", "method": "GET", "expect_status": [200, 503]},
            {"path": "/api/bots", "method": "GET", "expect_status": [200, 401]},
            {"path": "/api/subscription", "method": "GET", "expect_status": [200, 401]}
        ]
        
        for endpoint in endpoints:
            def test():
                url = f"{self.base_url}{endpoint['path']}"
                
                if endpoint["method"] == "POST":
                    response = self.session.post(url, json={"test": "data"})
                else:
                    response = self.session.get(url)
                
                if response.status_code not in endpoint["expect_status"]:
                    raise Exception(f"Expected {endpoint['expect_status']}, got {response.status_code}")
            
            self.run_test(f"API: {endpoint['path']}", test)

    def run_all_tests(self):
        print(f"🌐 Testing application at: {self.base_url}")
        print("=" * 50)
        
        self.test_health_endpoint()
        self.test_comprehensive_endpoint()
        self.test_static_pages()
        self.test_api_endpoints()
        
        self.print_summary()

    def print_summary(self):
        print("\n" + "=" * 50)
        print("📈 TEST SUMMARY")
        print("=" * 50)
        
        passed = len([r for r in self.results if r["status"] == "pass"])
        failed = len([r for r in self.results if r["status"] == "fail"])
        total = len(self.results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {failed}/{total}")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if result["status"] == "fail":
                    print(f"   • {result['name']}: {result['error']}")
        
        avg_duration = sum(r["duration"] for r in self.results) / total
        print(f"⏱️ Average response time: {avg_duration:.0f}ms")
        
        if failed == 0:
            print("\n🎉 All tests passed! Your application is working correctly.")
        else:
            print(f"\n⚠️ {failed} test(s) failed. Please review the issues above.")

def main():
    base_url = os.environ.get('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
    tester = DeploymentTester(base_url)
    
    try:
        tester.run_all_tests()
    except Exception as e:
        print(f"💥 Test runner failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
