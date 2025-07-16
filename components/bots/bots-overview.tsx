// File: components/bots/bots-overview.tsx

import React from 'react'

export type ChangeType = 'positive' | 'negative' | 'neutral'

export interface BotStat {
  title: string
  value: number | string
  change: number
  changeType: ChangeType
}

interface BotsOverviewProps {
  stats: BotStat[]
}

const BotsOverview: React.FC<BotsOverviewProps> = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {stats.map((stat) => (
      <div key={stat.title} className="border rounded-lg p-5 shadow-sm">
        <div className="text-sm font-medium text-gray-500">{stat.title}</div>
        <div className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</div>
        <div
          className={`mt-3 inline-flex items-center px-2 py-1 border rounded-full text-sm ${
            stat.changeType === 'positive'
              ? 'border-green-500 bg-green-50 text-green-700'
              : stat.changeType === 'negative'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 bg-gray-50 text-gray-700'
          }`}
        >
          {stat.change > 0 ? '+' : ''}
          {stat.change}%
        </div>
      </div>
    ))}
  </div>
)

export default BotsOverview
