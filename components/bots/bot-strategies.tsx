import React from 'react'

export interface BotStrategy {
  name: string
  enabled: boolean
}

export interface BotStrategiesProps {
  strategies: BotStrategy[]
}

export function BotStrategies({ strategies }: BotStrategiesProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-3">Available Strategies</h2>
      <ul className="list-disc list-inside space-y-1">
        {strategies.map((s) => (
          <li key={s.name}>
            {s.name} — {s.enabled ? 'Enabled' : 'Disabled'}
          </li>
        ))}
      </ul>
    </div>
  )
}
