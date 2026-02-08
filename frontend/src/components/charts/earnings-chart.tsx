'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface EarningsData {
  month: string
  earnings: number
  lastYear?: number
}

interface EarningsChartProps {
  data: EarningsData[]
}

export function EarningsChart({ data }: EarningsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }} 
          axisLine={false} 
          tickLine={false} 
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          axisLine={false} 
          tickLine={false} 
          tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`} 
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          formatter={(value: number, name: string) => [
            `${value.toLocaleString()} FCFA`,
            'Revenus'
          ]}
        />
        <Area 
          type="monotone" 
          dataKey="earnings" 
          stroke="#10b981" 
          strokeWidth={3}
          fill="#10b981"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
