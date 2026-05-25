'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  Plus,
  Minus,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useStatsStore } from '@/store/stats-store'
import { useWalletStore } from '@/store/wallet-store'
import { useAppStore } from '@/store/app-store'
import { formatCurrency } from '@/lib/utils'
import { MiniStatCard } from '@/components/stats-cards'
import { IncomeExpenseChart } from '@/components/charts/income-expense-chart'
import { MonthlyChart } from '@/components/charts/monthly-chart'
import { CategoryPieChart } from '@/components/charts/category-pie-chart'
import type { Transaction } from '@/types'

// Interface matching the actual API response shape
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
  recentTransactions: Transaction[]
}

// Animated number component
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={value}
    >
      {formatCurrency(value)}
    </motion.span>
  )
}

// Loading skeleton for the dashboard
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Balance card skeleton */}
      <Skeleton className="h-44 w-full rounded-2xl" />
      {/* Mini cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      {/* Action buttons skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      {/* Category + Recent skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  )
}

// Empty state component
function EmptyState() {
  const { setActiveView } = useAppStore()

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
        <Wallet className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Mulai Kelola Keuanganmu
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Tambahkan transaksi pertamamu untuk mulai melacak pemasukan dan
        pengeluaran.
      </p>
      <div className="mt-4 flex gap-3">
        <Button
          onClick={() => setActiveView('add-transaction')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="mr-1 h-4 w-4" />
          Tambah Pemasukan
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveView('add-transaction')}
        >
          <Minus className="mr-1 h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </div>
    </div>
  )
}

// Recent transaction item
function RecentTransactionItem({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'income'
  const date = new Date(transaction.date)
  const formattedDate = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/50">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
        style={{
          backgroundColor: isIncome
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(239, 68, 68, 0.1)',
        }}
      >
        {transaction.category?.icon || (isIncome ? '💰' : '📦')}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {transaction.description || transaction.category?.name || 'Transaksi'}
        </p>
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
      </div>
      <span
        className={`text-sm font-semibold ${
          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
        }`}
      >
        {isIncome ? '+' : '-'}
        {formatCurrency(transaction.amount)}
      </span>
    </div>
  )
}

export function Dashboard() {
  const { stats, isLoading: statsLoading, fetchStats } = useStatsStore()
  const { wallet, isLoading: walletLoading, fetchWallet } = useWalletStore()
  const { setActiveView } = useAppStore()

  useEffect(() => {
    fetchStats()
    fetchWallet()
  }, [fetchStats, fetchWallet])

  const isLoading = statsLoading || walletLoading

  if (isLoading && !stats) {
    return <DashboardSkeleton />
  }

  // Cast stats to match the actual API response shape
  const statsData = stats as unknown as StatsData | null

  // Check if user has any data
  const hasTransactions =
    statsData?.recentTransactions && statsData.recentTransactions.length > 0

  // Separate expense categories for the pie chart
  const expenseCategories =
    statsData?.categoryBreakdown?.filter(
      (cat) => cat.categoryType === 'expense' && cat.amount > 0
    ) || []

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* === Balance Card Section === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 shadow-lg sm:p-8">
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="absolute right-20 top-16 h-16 w-16 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-white/80">
                Total Saldo
              </span>
            </div>
            <div className="mt-3">
              <AnimatedNumber
                value={wallet?.balance ?? statsData?.totalBalance ?? 0}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              />
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                <span>{statsData?.recentTransactions?.length ?? 0} transaksi terbaru</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* === Mini Stat Cards === */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MiniStatCard
          icon={TrendingUp}
          label="Pemasukan Bulan Ini"
          value={statsData?.totalIncomeThisMonth ?? 0}
          accentColor="green"
          delay={0.1}
        />
        <MiniStatCard
          icon={TrendingDown}
          label="Pengeluaran Bulan Ini"
          value={statsData?.totalExpenseThisMonth ?? 0}
          accentColor="red"
          delay={0.2}
        />
      </div>

      {/* === Quick Action Buttons === */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-wrap gap-3"
      >
        <Button
          onClick={() => setActiveView('add-transaction')}
          className="gap-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Tambah Pemasukan
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveView('add-transaction')}
          className="gap-1.5 rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <Minus className="h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </motion.div>

      {/* === Empty State === */}
      {!hasTransactions && !isLoading ? (
        <EmptyState />
      ) : (
        <>
          {/* === Charts Section === */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <IncomeExpenseChart data={statsData?.dailyStats ?? []} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <MonthlyChart data={statsData?.monthlyStats ?? []} />
            </motion.div>
          </div>

          {/* === Category Breakdown + Recent Transactions === */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <CategoryPieChart data={expenseCategories} />
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="rounded-2xl border bg-card shadow-sm">
                <div className="flex items-center justify-between p-5 pb-3">
                  <h3 className="text-base font-semibold text-foreground">
                    Transaksi Terakhir
                  </h3>
                  <button
                    onClick={() => setActiveView('transactions')}
                    className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    Lihat Semua
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-1 px-3 pb-4">
                  <AnimatePresence>
                    {statsData?.recentTransactions?.map(
                      (transaction: Transaction, index: number) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <RecentTransactionItem transaction={transaction} />
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                  {(!statsData?.recentTransactions ||
                    statsData.recentTransactions.length === 0) && (
                    <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                      Belum ada transaksi
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
