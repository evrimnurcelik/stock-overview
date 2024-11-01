import React from 'react'

export const ChartContainer = ({ children, config, className }) => (
  <div className={className}>
    {children}
  </div>
)

export const ChartTooltip = ({ content }) => (
  <div className="bg-white p-2 border border-gray-200 rounded shadow">
    {content}
  </div>
)

export const ChartTooltipContent = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
      </div>
    )
  }

  return null
}