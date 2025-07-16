// File: components/dashboard/active-strategies.tsx

import React from 'react'
import { Button } from '@/components/ui/button'
import { Settings, Trash2 } from 'lucide-react'

interface Strategy {
  id: string
  name: string
  status: string
  lastRun: string
  // …any other fields you need
}

interface ActiveStrategiesProps {
  strategies: Strategy[]
}

export default function ActiveStrategies({ strategies }: ActiveStrategiesProps) {
  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold">Active Strategies</h2>
      <ul className="space-y-4">
        {strategies.map((strategy) => (
          <li
            key={strategy.id}
            className="flex justify-between items-center border border-gray-200 rounded-lg p-4"
          >
            <div>
              <p className="font-medium">{strategy.name}</p>
              <p className="text-sm text-gray-500">
                Status: <span className="font-semibold">{strategy.status}</span>
              </p>
              <p className="text-sm text-gray-500">
                Last Run:{' '}
                <span className="font-semibold">{new Date(strategy.lastRun).toLocaleString()}</span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-gray-400 hover:text-white"
                onClick={() => {
                  /* handle settings click */
                }}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-red-500 hover:text-red-600"
                onClick={() => {
                  /* handle delete click */
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
