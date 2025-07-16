import React from 'react'

export interface BotPerformanceProps {
  data: {
    date: string // ISO date string
    performance: number // e.g. percent change
  }[]
}

export function BotPerformance({ data }: BotPerformanceProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-3">Bot Performance</h2>
      <ul className="space-y-1">
        {data.map((point) => (
          <li key={point.date} className="flex justify-between">
            <span>{new Date(point.date).toLocaleDateString()}</span>
            <span>
              {point.performance > 0 ? '+' : ''}
              {point.performance}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
