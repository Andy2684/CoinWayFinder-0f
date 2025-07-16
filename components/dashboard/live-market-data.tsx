// File: components/dashboard/live-market-data.tsx

import React from 'react'

export interface LiveMarketDataProps {
  data: {
    symbol: string
    price: number
    change24h: number
  }[]
}

export function LiveMarketData({ data }: LiveMarketDataProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Live Market Data</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.symbol} className="p-3 border rounded hover:shadow transition">
            <p className="font-medium">{item.symbol}</p>
            <p className="text-lg">${item.price.toLocaleString()}</p>
            <p className={`text-sm ${item.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {item.change24h >= 0 ? '+' : ''}
              {item.change24h}%
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
