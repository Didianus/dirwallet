'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface CategoryDataPoint {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  categoryType: string
  amount: number
}

interface CategoryPieChartProps {
  data: CategoryDataPoint[]
}

const DEFAULT_COLORS = [
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#6366f1',
  '#14b8a6',
  '#e11d48',
  '#a855f7',
  '#0ea5e9',
]

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: CategoryDataPoint; value: number }>
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-base">{item.categoryIcon}</span>
        <span className="font-medium text-foreground">{item.categoryName}</span>
      </div>
      <p className="mt-1 text-sm font-bold text-foreground">
        {formatCurrency(item.amount)}
      </p>
    </div>
  )
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string; payload: CategoryDataPoint }> }) {
  if (!payload?.length) return null

  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 px-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5 text-xs">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.payload.categoryIcon} {entry.value}
          </span>
          <span className="font-medium text-foreground">
            {formatCurrency(entry.payload.amount)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0)

  const chartData = data.map((item, index) => ({
    ...item,
    color: item.categoryColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }))

  if (data.length === 0) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Kategori Pengeluaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Belum ada data pengeluaran bulan ini
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Kategori Pengeluaran
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="relative h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
                dataKey="amount"
                nameKey="categoryName"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-[10px] font-medium text-muted-foreground">Total</p>
            <p className="text-sm font-bold text-foreground">
              {total >= 1000000
                ? `${(total / 1000000).toFixed(1)}jt`
                : total >= 1000
                  ? `${(total / 1000).toFixed(0)}rb`
                  : `${total}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
