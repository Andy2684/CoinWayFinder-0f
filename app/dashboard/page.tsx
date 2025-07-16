import React from 'react'
import TradeLogs, { Log } from '../../components/dashboard/TradeLogs'
import QuickActions, { Action } from '../../components/dashboard/QuickActions'

export default function DashboardPage() {
  const logs: Log[] = [
    {
      time: '2025-07-15 20:00',
      action: 'Bought BTC',
      asset: 'BTC',
      amount: 0.01,
      result: '+$25',
    },
    {
      time: '2025-07-15 21:30',
      action: 'Sold ETH',
      asset: 'ETH',
      amount: 0.05,
      result: '+$15',
    },
  ]

  const actions: Action[] = [
    { id: '1', label: 'Start Bot' },
    { id: '2', label: 'Stop Bot' },
  ]

  return (
    <div className="p-6 space-y-6">
      <TradeLogs logs={logs} />
      <QuickActions actions={actions} />
    </div>
  )
}
