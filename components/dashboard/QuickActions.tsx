import React from 'react'
import { Button } from '@/components/ui/button'

// ✅ экспортируем тип
export interface Action {
  id: string
  label: string
  onClick?: () => void
}

interface QuickActionsProps {
  actions?: Action[]
}

export default function QuickActions({ actions = [] }: QuickActionsProps) {
  return (
    <div className="p-4 border rounded-xl bg-white dark:bg-gray-900 shadow mt-4">
      <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
      {actions.length === 0 ? (
        <p className="text-sm text-gray-500">No actions available.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button key={action.id} onClick={action.onClick} className="text-sm px-4 py-2">
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
