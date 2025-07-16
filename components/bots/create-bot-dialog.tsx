// File: components/bots/create-bot-dialog.tsx

import React, { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface Strategy {
  id: string
  name: string
  description: string
}

export interface CreateBotDialogProps {
  strategies: Strategy[]
  onCreate: (config: { strategy: string; name: string }) => void
}

export default function CreateBotDialog({ strategies, onCreate }: CreateBotDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [botName, setBotName] = useState('')

  const handleCreate = () => {
    if (selectedStrategy && botName.trim()) {
      onCreate({ strategy: selectedStrategy, name: botName })
      setOpen(false)
      setBotName('')
      setSelectedStrategy(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Bot</Button>
      </DialogTrigger>
      <DialogContent className="w-[400px]">
        <h2 className="text-2xl font-semibold mb-4">New Bot Configuration</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Bot Name</label>
          <input
            type="text"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <h3 className="text-lg font-medium mb-2">Select Strategy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {strategies.map((strategy) => (
            <button
              key={strategy.id}
              type="button"
              className={`w-full text-left border rounded-lg p-4 shadow-sm focus:outline-none ${
                strategy.id === selectedStrategy
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedStrategy(strategy.id)
              }}
            >
              <Card className="w-full bg-transparent shadow-none p-0">
                <h4 className="font-semibold">{strategy.name}</h4>
                <p className="text-sm text-gray-600">{strategy.description}</p>
              </Card>
            </button>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!selectedStrategy || !botName}>
            Create Bot
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
