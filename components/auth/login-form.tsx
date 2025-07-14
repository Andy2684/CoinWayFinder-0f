// components/auth/login-form.tsx

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const { login, error } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    try {
      // login бросит ошибку в случае неуспеха
      await login(formData.email, formData.password);
      setSuccessMessage("Login successful! Redirecting...");
      // перенаправление через 1 секундy
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (e: any) {
      // Ошибка уже доступна в error из useAuth, но можно дублировать здесь
      console.error("Login error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Sign In</h2>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {successMessage && <div className="text-green-600 mb-2">{successMessage}</div>}

      <label className="block mb-2">
        Email
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </label>

      <label className="block mb-4">
        Password
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Logging in…" : "Login"}
      </button>
    </form>
  );
}
