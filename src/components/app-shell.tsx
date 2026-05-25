'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { AuthPages } from '@/components/auth-pages'
import { Dashboard } from '@/components/dashboard'
import { TransactionHistory } from '@/components/transaction-history'
import { AddTransaction } from '@/components/add-transaction'
import { CategoryManagement } from '@/components/category-management'
import { AdminDashboard } from '@/components/admin-dashboard'
import { SettingsView } from '@/components/settings-view'
import { Wallet } from 'lucide-react'

const viewComponents: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  transactions: TransactionHistory,
  'add-transaction': AddTransaction,
  categories: CategoryManagement,
  admin: AdminDashboard,
  settings: SettingsView,
}

export function AppShell() {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore()
  const { activeView } = useAppStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  // Not authenticated - show auth pages
  if (!isAuthenticated) {
    return <AuthPages />
  }

  // Authenticated - show app layout
  const ActiveViewComponent = viewComponents[activeView] || Dashboard

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveViewComponent />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
