// app/login/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import "../globals.css"

export default function LoginPage() {
  const [email, setEmail] = useState("project.command.center@gmail.com")
  const [password, setPassword] = useState("YourAdminPassword")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      localStorage.setItem("authToken", json.token)
      router.push("/analytics")
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}>
      <div className="card" style={{ maxWidth: 400, width: "100%" }}>
        <h1 style={{ textAlign: "center", marginBottom: 24, color: "var(--accent2)" }}>
          🚀 Login
        </h1>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={{ color: "var(--text-light)" }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label style={{ color: "var(--text-light)" }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit">Sign In</button>
          {error && (
            <p style={{ color: "#f87171", textAlign: "center" }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
