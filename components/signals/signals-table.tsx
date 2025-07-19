'use client'

type Signal = {
  asset: string
  type: 'Buy' | 'Sell'
  confidence: number
}

const dummySignals: Signal[] = [
  { asset: 'BTC/USDT', type: 'Buy', confidence: 85 },
  { asset: 'ETH/USDT', type: 'Sell', confidence: 78 },
  { asset: 'SOL/USDT', type: 'Buy', confidence: 91 },
]

export function SignalsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Asset</th>
            <th className="py-2 px-4 border-b">Type</th>
            <th className="py-2 px-4 border-b">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {dummySignals.map((signal, index) => (
            <tr key={index} className="text-center">
              <td className="py-2 px-4 border-b">{signal.asset}</td>
              <td className="py-2 px-4 border-b">{signal.type}</td>
              <td className="py-2 px-4 border-b">{signal.confidence}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
