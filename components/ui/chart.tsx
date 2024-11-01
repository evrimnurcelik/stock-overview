import React, { ReactNode } from 'react'

interface ChartContainerProps {
  children: ReactNode
  config: Record<string, unknown>
  className?: string
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ children, className }) => (
  <div className={className}>
    {children}
  </div>
)

interface ChartTooltipProps {
  content: ReactNode
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ content }) => (
  <div className="bg-white p-2 border border-gray-200 rounded shadow">
    {content}
  </div>
)

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

export const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
      </div>
    )
  }

  return null
}