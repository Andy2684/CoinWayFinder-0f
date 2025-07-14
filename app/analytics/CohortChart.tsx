// app/analytics/CohortChart.tsx
"use client"

import React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

type Cohort = { month: string; count: number }

export default function CohortChart({ data }: { data: Cohort[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid stroke="#444" strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="#fff" tick={{ fill: "#fff" }} />
        <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#222", borderColor: "#555" }}
          labelStyle={{ color: "#ddd" }}
          itemStyle={{ color: "#fff" }}
        />
        <Bar dataKey="count" name="New Users" fill="var(--accent1)" />
      </BarChart>
    </ResponsiveContainer>
  )
}
