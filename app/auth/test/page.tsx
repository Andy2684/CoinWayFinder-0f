// app/auth/test/page.tsx

"use client";

import { useState } from "react";
import { useAuth } from "../../../components/auth/auth-provider";

export const dynamic = "force-dynamic";

export default function AuthTestPage() {
  const { user, login, logout, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [testResults, setTestResults] = useState<string[]>([]);

  const handleLogin = async () => {
    try {
      await login(email, password);
      setTestResults((prev) => [...prev, `Logged in as ${email}`]);
    } catch (e: any) {
      setTestResults((prev) => [...prev, `Login error: ${e.message}`]);
    }
  };

  const handleLogout = () => {
    logout();
    setTestResults((prev) => [...prev, "Logged out"]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Auth Test Page</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleLogout} style={{ marginLeft: 8 }}>
          Logout
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: 20 }}>Error: {error}</div>
      )}

      <div style={{ marginBottom: 20 }}>
        <strong>Current user:</strong>{" "}
        {user ? `${user.email} (ID: ${user.id})` : "Not logged in"}
      </div>

      <div>
        <strong>Test log:</strong>
        <ul>
          {testResults.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
