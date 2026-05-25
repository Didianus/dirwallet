import { create } from 'zustand'

// The stats API returns a raw object with these fields
interface StatsData {
  totalBalance: number
  totalIncomeThisMonth: number
  totalExpenseThisMonth: number
  dailyStats: Array<{
    date: string
    day: number
    income: number
    expense: number
  }>
  monthlyStats: Array<{
    month: string
    monthIndex: number
    income: number
    expense: number
  }>
  categoryBreakdown: Array<{
    categoryId: string
    categoryName: string
    categoryIcon: string
    categoryColor: string
    categoryType: string
    amount: number
  }>
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    description: string
    status: string
    date: string
    category: {
      id: string
      name: string
      icon: string
      color: string
      type: string
    }
  }>
}

interface StatsState {
  stats: StatsData | null
  isLoading: boolean
  error: string | null
  fetchStats: () => Promise<void>
}

export const useStatsStore = create<StatsState>()((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/stats')

      if (!res.ok) {
        set({ isLoading: false, error: 'Gagal mengambil statistik' })
        return
      }

      // API returns the stats object directly
      const data = await res.json()
      set({ stats: data, isLoading: false })
    } catch {
      set({ isLoading: false, error: 'Kesalahan jaringan. Silakan coba lagi.' })
    }
  },
}))
