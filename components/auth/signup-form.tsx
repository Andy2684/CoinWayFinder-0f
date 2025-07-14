// components/auth/signup-form.tsx

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

interface SignupFormData {
  email: string;
  password: string;
}

export function SignupForm() {
  const router = useRouter();
  const { signup, error } = useAuth();

  const [formData, setFormData] = useState<SignupFormData>({
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
      await signup(formData.email, formData.password);
      setSuccessMessage("Signup successful! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch {
      // Ошибка будет в `error`
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Sign Up</h2>

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
        className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {loading ? "Signing up…" : "Sign Up"}
      </button>
    </form>
  );
}
