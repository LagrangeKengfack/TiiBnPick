'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ComparisonData {
  month: string
  lastYear: number
  earnings: number
}

interface ComparisonChartProps {
  data: ComparisonData[]
}

export function ComparisonChart({ data }: ComparisonChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
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
            name === 'lastYear' ? 'Année précédente' : 'Année actuelle'
          ]}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          payload={[
            { value: 'Année précédente', type: 'square', id: 'PL', color: '#94a3b8' },
            { value: 'Année actuelle', type: 'square', id: 'CA', color: '#f97316' },
          ]}
        />
        <Bar dataKey="lastYear" name="Année précédente" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="earnings" name="Année actuelle" fill="#f97316" radius={[0, 0, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
