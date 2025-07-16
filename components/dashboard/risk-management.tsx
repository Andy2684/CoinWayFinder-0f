'use client'

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'

type RiskSettings = {
  maxDrawdown: number
}

export default function RiskManagement() {
  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    maxDrawdown: 5,
  })

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Risk Management Settings</h2>

      <div>
        <label className="block mb-2">Max Drawdown: {riskSettings.maxDrawdown}%</label>
        <Slider
          value={[riskSettings.maxDrawdown]}
          onValueChange={(value: number[]) =>
            setRiskSettings({ ...riskSettings, maxDrawdown: value[0] })
          }
          max={20}
          step={1}
        />
      </div>
    </div>
  )
}
