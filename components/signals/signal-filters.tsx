'use client'

import { useState } from 'react'

type FilterProps = {
  filters: string[]
  onFiltersChange: (newFilters: string[]) => void
}

const allOptions = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP']

export default function SignalFilters({ filters, onFiltersChange }: FilterProps) {
  const [selected, setSelected] = useState<string[]>(filters)

  const toggleFilter = (token: string) => {
    const newSelected = selected.includes(token)
      ? selected.filter((f) => f !== token)
      : [...selected, token]

    setSelected(newSelected)
    onFiltersChange(newSelected)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allOptions.map((token) => (
        <button
          key={token}
          onClick={() => toggleFilter(token)}
          className={`px-4 py-2 rounded-full border text-sm ${
            selected.includes(token) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {token}
        </button>
      ))}
    </div>
  )
}
