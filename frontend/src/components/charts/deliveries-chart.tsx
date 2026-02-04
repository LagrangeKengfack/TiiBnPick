'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DeliveryData {
  month: string
  deliveries: number
}

interface DeliveriesChartProps {
  data: DeliveryData[]
}

export function DeliveriesChart({ data }: DeliveriesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          formatter={(value: number) => [value, 'Livraisons']}
        />
        <Line 
          type="monotone" 
          dataKey="deliveries" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
