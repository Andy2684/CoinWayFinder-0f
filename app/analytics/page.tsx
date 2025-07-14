// app/analytics/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import "../globals.css"
import CohortChart from "./CohortChart"

type Cohort = { month: string; count: number }

export default function AnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState<Cohort[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      router.replace("/login")
    }
  }, [router])

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("authToken")
        const res = await fetch("/api/analytics/cohort", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
        setData(json.data)
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchData()
  }, [])

  if (error) return <p style={{ padding: 20, color: "#f87171" }}>Error: {error}</p>
  if (!data) return <p style={{ padding: 20 }}>Loading cohorts…</p>

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: "var(--accent2)" }}>📊 Cohort Analysis</h1>
      <div className="card">
        <CohortChart data={data} />
      </div>
    </div>
  )
}
