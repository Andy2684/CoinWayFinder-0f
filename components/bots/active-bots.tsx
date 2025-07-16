// File: components/bots/active-bots.tsx

import React from 'react'

export interface ActiveBotsProps {
  bots: {
    id: string
    name: string
    status: string
    lastRun: string // ISO timestamp
  }[]
}

export function ActiveBots({ bots }: ActiveBotsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bots.map((bot) => (
        <div
          key={bot.id}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">{bot.name}</h3>
          <p className="text-sm">
            <span className="font-medium">Status:</span> {bot.status}
          </p>
          <p className="text-sm">
            <span className="font-medium">Last Run:</span> {new Date(bot.lastRun).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
