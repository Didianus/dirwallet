'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Receipt,
  Wallet,
  UserPlus,
  RefreshCw,
  ShieldX,
  Search,
  Mail,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

// Admin user type from API
interface AdminUser {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  walletBalance: number
  transactionCount: number
  createdAt: string
}

// Admin stats type from API
interface AdminStats {
  totalUsers: number
  totalTransactions: number
  totalBalance: number
  newUsersThisMonth: number
  transactionsThisMonth: number
  totalIncome: number
  totalExpense: number
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
  delay,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  subtitle?: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-0 shadow-sm overflow-hidden dark:bg-card/80">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}18` }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 text-xl font-bold text-foreground truncate">
                {value}
              </p>
              {subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Stat cards skeleton
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// User row skeleton
function UserRowSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

// Mobile user card
function MobileUserCard({ user, index }: { user: AdminUser; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
    >
      <Card className="border-0 shadow-sm dark:bg-card/80">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </p>
              </div>
            </div>
            <Badge
              className={`text-[10px] px-1.5 py-0 border-0 ${
                user.role === 'admin'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}
            >
              {user.role === 'admin' ? 'Admin' : 'User'}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Saldo: <span className="font-semibold text-foreground">{formatCurrency(user.walletBalance)}</span></span>
            <span>{user.transactionCount} transaksi</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(user.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Access Denied Component
function AccessDenied() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center"
      >
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
          <ShieldX className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Akses Ditolak</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses halaman ini. Hanya admin yang dapat melihat dashboard admin.
        </p>
      </motion.div>
    </div>
  )
}

const ITEMS_PER_PAGE = 10

export function AdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError(null)
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setStatsError(data.error || 'Gagal mengambil statistik')
        return
      }
      const data = await res.json()
      setStats(data)
    } catch {
      setStatsError('Kesalahan jaringan. Silakan coba lagi.')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setUsersError(data.error || 'Gagal mengambil data pengguna')
        return
      }
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      setUsersError('Kesalahan jaringan. Silakan coba lagi.')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats()
      fetchUsers()
    }
  }, [user, fetchStats, fetchUsers])

  // Access control
  if (user?.role !== 'admin') {
    return <AccessDenied />
  }

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleRefresh = () => {
    fetchStats()
    fetchUsers()
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Statistik dan manajemen sistem
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={statsLoading || usersLoading}
          className="gap-1.5 rounded-xl"
        >
          <RefreshCw className={`h-4 w-4 ${statsLoading || usersLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </motion.div>

      {/* Error banners */}
      {statsError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {statsError}
        </div>
      )}
      {usersError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {usersError}
        </div>
      )}

      {/* Overview Stats Cards */}
      {statsLoading && !stats ? (
        <StatsSkeleton />
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total Pengguna"
              value={stats.totalUsers}
              subtitle={`${stats.newUsersThisMonth} baru bulan ini`}
              color="#10b981"
              delay={0.1}
            />
            <StatCard
              icon={Receipt}
              label="Total Transaksi"
              value={stats.totalTransactions}
              subtitle={`${stats.transactionsThisMonth} bulan ini`}
              color="#f59e0b"
              delay={0.15}
            />
            <StatCard
              icon={Wallet}
              label="Total Saldo Sistem"
              value={formatCurrency(stats.totalBalance)}
              color="#0d9488"
              delay={0.2}
            />
            <StatCard
              icon={UserPlus}
              label="Pengguna Baru"
              value={stats.newUsersThisMonth}
              subtitle="Bulan ini"
              color="#8b5cf6"
              delay={0.25}
            />
          </div>

          {/* Income/Expense Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="border-l-4 border-l-emerald-500 border-0 shadow-sm dark:bg-card/80" style={{ borderLeftWidth: '4px', borderLeftColor: '#10b981' }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Total Pemasukan Sistem
                      </p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(stats.totalIncome)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <Card className="border-l-4 border-l-red-500 border-0 shadow-sm dark:bg-card/80" style={{ borderLeftWidth: '4px', borderLeftColor: '#ef4444' }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Total Pengeluaran Sistem
                      </p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(stats.totalExpense)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      ) : null}

      {/* Users Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="border-0 shadow-sm dark:bg-card/80">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
              <h3 className="text-base font-semibold text-foreground">
                Daftar Pengguna
              </h3>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama atau email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Select
                  value={roleFilter}
                  onValueChange={(val) => {
                    setRoleFilter(val)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Filter Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead className="text-center">Transaksi</TableHead>
                    <TableHead>Bergabung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <UserRowSkeleton />
                  ) : paginatedUsers.length > 0 ? (
                    paginatedUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {u.email}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] px-1.5 py-0 border-0 ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}
                          >
                            {u.role === 'admin' ? 'Admin' : 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(u.walletBalance)}
                        </TableCell>
                        <TableCell className="text-center">
                          {u.transactionCount}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(u.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Tidak ada pengguna ditemukan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3 max-h-96 overflow-y-auto">
              {usersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-0 shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-20" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((u, index) => (
                  <MobileUserCard key={u.id} user={u} index={index} />
                ))
              ) : (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  Tidak ada pengguna ditemukan
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredUsers.length > ITEMS_PER_PAGE && (
              <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} dari {filteredUsers.length} pengguna
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-foreground">
                    {safeCurrentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
