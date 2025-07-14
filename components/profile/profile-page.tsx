// components/profile/profile-page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export function ProfilePageComponent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // TODO: ваш API-вызов для обновления профиля
      // await fetch("/api/auth/update-profile", { method: "POST", body: JSON.stringify(formData) });
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Update failed" });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Your Profile</h2>

      {message && (
        <div className={message.type === "success" ? "text-green-600 mb-4" : "text-red-600 mb-4"}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Email
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </label>

        <label className="block">
          Current Password
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              className="w-full mt-1 p-2 border rounded"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute right-2 top-2 text-sm text-gray-500"
            >
              {showCurrentPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <label className="block">
          New Password
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </label>

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Updating…" : "Update Profile"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 p-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  );
}
