'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Pencil,
  Trash2,
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  CalendarIcon,
  Receipt,
  X,
} from 'lucide-react'
import { format } from 'date-fns'

import { useTransactionStore } from '@/store/transaction-store'
import { useCategoryStore } from '@/store/category-store'
import { formatCurrency, cn } from '@/lib/utils'
import type { Transaction } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditTransactionDialog } from '@/components/edit-transaction-dialog'
import { TransactionDetailDialog } from '@/components/transaction-detail-dialog'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { toast } from 'sonner'

export function TransactionHistory() {
  const {
    transactions,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    fetchTransactions,
    deleteTransaction,
  } = useTransactionStore()
  const { categories, fetchCategories } = useCategoryStore()

  // Dialog states
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Track if this is the initial load
  const initialLoadDone = useRef(false)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Fetch transactions on mount and when filters change
  // Use JSON.stringify to create a stable dependency for the filters object
  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    fetchTransactions(1)
    initialLoadDone.current = true
  }, [filtersKey, fetchTransactions])

  // Debounced search
  const [searchInput, setSearchInput] = useState(filters.search)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters({ search: searchInput })
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput, filters.search, setFilters])

  const handlePageChange = useCallback(
    (page: number) => {
      fetchTransactions(page)
    },
    [fetchTransactions]
  )

  const handleDelete = async () => {
    if (!deletingTransaction) return
    setIsDeleting(true)
    const result = await deleteTransaction(deletingTransaction.id)
    setIsDeleting(false)
    if (result) {
      toast.success('Transaksi berhasil dihapus')
      setDeletingTransaction(null)
    } else {
      toast.error('Gagal menghapus transaksi')
    }
  }

  const handleResetFilters = () => {
    resetFilters()
    setSearchInput('')
  }

  const hasActiveFilters =
    filters.type || filters.categoryId || filters.startDate || filters.endDate || filters.status

  // Export to Excel
  const exportExcel = async () => {
    try {
      const XLSX = await import('xlsx')
      const { saveAs } = await import('file-saver')

      const data = transactions.map((t) => ({
        Tanggal: format(new Date(t.date), 'dd/MM/yyyy'),
        Deskripsi: t.description,
        Kategori: t.category?.name || '-',
        Tipe: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        Jumlah: t.amount,
        Status:
          t.status === 'completed'
            ? 'Selesai'
            : t.status === 'pending'
            ? 'Tertunda'
            : 'Dibatalkan',
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Transaksi')

      // Auto-size columns
      const colWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(
          key.length,
          ...data.map((row) => String(row[key as keyof typeof row] || '').length)
        ) + 2,
      }))
      ws['!cols'] = colWidths

      const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      saveAs(blob, `transaksi_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
      toast.success('File Excel berhasil diunduh')
    } catch {
      toast.error('Gagal mengekspor ke Excel')
    }
  }

  // Export to PDF
  const exportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF()

      // Title
      doc.setFontSize(16)
      doc.text('Riwayat Transaksi', 14, 20)
      doc.setFontSize(10)
      doc.text(`Diekspor pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm')}`, 14, 28)

      const tableData = transactions.map((t) => [
        format(new Date(t.date), 'dd/MM/yyyy'),
        t.description,
        t.category?.name || '-',
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        formatCurrency(t.amount),
        t.status === 'completed'
          ? 'Selesai'
          : t.status === 'pending'
          ? 'Tertunda'
          : 'Dibatalkan',
      ])

      autoTable(doc, {
        startY: 35,
        head: [['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah', 'Status']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [16, 185, 129] },
      })

      doc.save(`transaksi_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      toast.success('File PDF berhasil diunduh')
    } catch {
      toast.error('Gagal mengekspor ke PDF')
    }
  }

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      completed: {
        label: 'Selesai',
        className:
          'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
      },
      pending: {
        label: 'Tertunda',
        className:
          'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      },
      cancelled: {
        label: 'Dibatalkan',
        className:
          'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
      },
    }
    const s = config[status] || config.pending
    return (
      <Badge variant="outline" className={cn('text-xs', s.className)}>
        {s.label}
      </Badge>
    )
  }

  // Render type badge
  const renderTypeBadge = (type: string) => {
    const isIncome = type === 'income'
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-xs gap-1',
          isIncome
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
            : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
        )}
      >
        {isIncome ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {isIncome ? 'Masuk' : 'Keluar'}
      </Badge>
    )
  }

  // Pagination range
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    start = Math.max(1, end - maxVisible + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  const startItem = (currentPage - 1) * 10 + 1
  const endItem = Math.min(currentPage * 10, totalCount)

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-emerald-500" />
            Riwayat Transaksi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount > 0
              ? `Menampilkan ${startItem}-${endItem} dari ${totalCount} transaksi`
              : 'Belum ada transaksi'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Ekspor</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportPDF} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4 text-red-500" />
                Ekspor PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportExcel} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                Ekspor Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'gap-1.5',
              showFilters && 'bg-emerald-600 hover:bg-emerald-700 text-white'
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-emerald-700">
                !
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari transaksi..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </motion.div>

      {/* Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Filter</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="gap-1 text-xs h-7 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Type Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Tipe
                  </label>
                  <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) =>
                      setFilters({ type: value === 'all' ? '' : value })
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Kategori
                  </label>
                  <Select
                    value={filters.categoryId || 'all'}
                    onValueChange={(value) =>
                      setFilters({ categoryId: value === 'all' ? '' : value })
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-1.5">
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Status
                  </label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) =>
                      setFilters({ status: value === 'all' ? '' : value })
                    }
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="pending">Tertunda</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Rentang Tanggal
                  </label>
                  <div className="flex gap-1.5">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'flex-1 h-9 text-xs justify-start',
                            !filters.startDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {filters.startDate
                            ? format(new Date(filters.startDate), 'dd/MM/yy')
                            : 'Dari'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            filters.startDate
                              ? new Date(filters.startDate)
                              : undefined
                          }
                          onSelect={(date) => {
                            setFilters({
                              startDate: date
                                ? date.toISOString().split('T')[0]
                                : '',
                            })
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'flex-1 h-9 text-xs justify-start',
                            !filters.endDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {filters.endDate
                            ? format(new Date(filters.endDate), 'dd/MM/yy')
                            : 'Sampai'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            filters.endDate
                              ? new Date(filters.endDate)
                              : undefined
                          }
                          onSelect={(date) => {
                            setFilters({
                              endDate: date
                                ? date.toISOString().split('T')[0]
                                : '',
                            })
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Table - Desktop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="hidden md:block"
      >
        <div className="rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full max-w-[100px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState />
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {format(new Date(transaction.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {transaction.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
                            style={{
                              backgroundColor: `${transaction.category?.color}20` || 'rgba(107,114,128,0.1)',
                            }}
                          >
                            {transaction.category?.icon}
                          </div>
                          <span className="text-sm">
                            {transaction.category?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{renderTypeBadge(transaction.type)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            transaction.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          )}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>{renderStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewingTransaction(transaction)}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingTransaction(transaction)}
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeletingTransaction(transaction)}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Transaction Cards - Mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="md:hidden space-y-3"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : transactions.length === 0 ? (
          <EmptyState />
        ) : (
          transactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onView={() => setViewingTransaction(transaction)}
              onEdit={() => setEditingTransaction(transaction)}
              onDelete={() => setDeletingTransaction(transaction)}
            />
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Menampilkan {startItem}-{endItem} dari {totalCount} hasil
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={cn(
                    'cursor-pointer',
                    currentPage === 1 && 'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>
              {getPageNumbers().map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => handlePageChange(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={cn(
                    'cursor-pointer',
                    currentPage === totalPages && 'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Dialogs */}
      <EditTransactionDialog
        transaction={editingTransaction}
        open={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />

      <TransactionDetailDialog
        transaction={viewingTransaction}
        open={!!viewingTransaction}
        onClose={() => setViewingTransaction(null)}
      />

      <DeleteConfirmationDialog
        transaction={deletingTransaction}
        open={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}

// Mobile card component
function TransactionCard({
  transaction,
  onView,
  onEdit,
  onDelete,
}: {
  transaction: Transaction
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const isIncome = transaction.type === 'income'
  const date = new Date(transaction.date)

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{
            backgroundColor: `${transaction.category?.color}20` || 'rgba(107,114,128,0.1)',
          }}
        >
          {transaction.category?.icon || (isIncome ? '💰' : '📦')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {transaction.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {transaction.category?.name} •{' '}
                {format(date, 'dd MMM yyyy')}
              </p>
            </div>
            <span
              className={cn(
                'text-sm font-semibold shrink-0',
                isIncome
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {isIncome ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {transaction.type === 'income' ? (
                <Badge
                  variant="outline"
                  className="text-[10px] gap-0.5 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                >
                  <ArrowUpRight className="h-2.5 w-2.5" />
                  Masuk
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] gap-0.5 bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                >
                  <ArrowDownRight className="h-2.5 w-2.5" />
                  Keluar
                </Badge>
              )}
              {transaction.status === 'completed' && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                >
                  Selesai
                </Badge>
              )}
              {transaction.status === 'pending' && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                >
                  Tertunda
                </Badge>
              )}
              {transaction.status === 'cancelled' && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                >
                  Dibatalkan
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onView}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
        <Receipt className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Belum Ada Transaksi
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Tidak ada transaksi yang ditemukan. Coba ubah filter atau tambahkan
        transaksi baru.
      </p>
    </div>
  )
}
