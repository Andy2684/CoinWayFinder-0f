import React from 'react'

// ✅ тип Log экспортируем отдельно
export interface Log {
  time: string
  asset: string
  action: string
  amount: number
  result: string
}

interface TradeLogsProps {
  logs?: Log[]
}

export default function TradeLogs({ logs = [] }: TradeLogsProps) {
  return (
    <div className="p-4 border rounded-xl bg-white dark:bg-gray-900 shadow">
      <h2 className="text-lg font-semibold mb-2">Trade Logs</h2>
      {logs.length === 0 ? (
        <p className="text-sm text-gray-500">No trades found.</p>
      ) : (
        <ul className="space-y-2">
          {logs.map((log, index) => (
            <li key={index} className="text-sm flex justify-between">
              <span>{log.time}</span>
              <span>{log.asset}</span>
              <span>{log.action}</span>
              <span>{log.amount}</span>
              <span>{log.result}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
