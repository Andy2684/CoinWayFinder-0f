"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";

export default function AuthTestPage() {
  const { user, login, logout } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [...prev, result]);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Auth Test</h2>
      <div className="mb-4">
        <p>User: {user ? user.email : "Not logged in"}</p>
      </div>
      <button
        onClick={async () => {
          const res = await login("test@example.com", "password");
          addTestResult(`Login: ${res.success}`);
        }}
        className="mr-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Test Login
      </button>
      <button
        onClick={async () => {
          await logout();
          addTestResult("Logout");
        }}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Test Logout
      </button>
      <ul className="mt-4 list-disc pl-5">
        {testResults.map((res, idx) => (
          <li key={idx}>{res}</li>
        ))}
      </ul>
    </div>
  );
}
