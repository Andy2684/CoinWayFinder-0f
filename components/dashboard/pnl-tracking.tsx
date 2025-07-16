import React from 'react'

export interface PnLDataPoint {
  date: string
  pnl: number
}

export interface PnLTrackingProps {
  data: PnLDataPoint[]
}

export function PnLTracking({ data }: PnLTrackingProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">P&L Tracking</h2>
      <ul className="space-y-2">
        {data.map((point) => (
          <li key={point.date} className="flex justify-between">
            <span>{new Date(point.date).toLocaleDateString()}</span>
            <span>
              {point.pnl >= 0 ? '+' : ''}
              {point.pnl}$
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
