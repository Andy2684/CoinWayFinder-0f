import React from 'react'
import { TooltipProps } from 'recharts'

interface CustomTooltipPayload {
  name?: string
  value?: number | string
  label?: string
  color?: string
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  className?: string
  indicator?: 'dot' | 'bar'
  hideLabel?: boolean
  payload?: CustomTooltipPayload[] // ✅ типизируем вручную
}

export function CustomTooltip({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0]

  return (
    <div className={`rounded-md border bg-background p-2 text-sm shadow-sm ${className}`}>
      {!hideLabel && <div className="font-medium">{data.label}</div>}
      <div className="text-muted-foreground">{data.value}</div>
    </div>
  )
}
