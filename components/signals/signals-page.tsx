'use client'

import React from 'react'

type Signal = {
  id: string
  asset: string
  type: 'Buy' | 'Sell'
  confidence: number
}

interface SignalsPageProps {
  signals?: Signal[]
}

export const SignalsPage = ({ signals = [] }: SignalsPageProps) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trading Signals</h1>
      <ul className="space-y-4">
        {signals.map((signal) => (
          <li
            key={signal.id}
            className="border border-gray-300 rounded-lg p-4 shadow-md bg-white"
          >
            <p className="text-lg font-semibold">{signal.asset}</p>
            <p>
              Type: <span className="font-medium">{signal.type}</span>
            </p>
            <p>
              Confidence:{' '}
              <span className="font-medium">{signal.confidence}%</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
