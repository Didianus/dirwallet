'use client'

import {
  ArrowUpRight,
  ArrowDownRight,
  CalendarIcon,
  Tag,
  Hash,
  CircleDot,
  ImageIcon,
} from 'lucide-react'
import { format } from 'date-fns'

import type { Transaction } from '@/types'
import { formatCurrency, cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface TransactionDetailDialogProps {
  transaction: Transaction | null
  open: boolean
  onClose: () => void
}

export function TransactionDetailDialog({
  transaction,
  open,
  onClose,
}: TransactionDetailDialogProps) {
  if (!transaction) return null

  const isIncome = transaction.type === 'income'
  const date = new Date(transaction.date)
  const createdDate = new Date(transaction.createdAt)

  const statusConfig: Record<
    string,
    { label: string; className: string }
  > = {
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

  const status = statusConfig[transaction.status] || statusConfig.pending

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isIncome ? (
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            )}
            Detail Transaksi
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap transaksi Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Highlight */}
          <div
            className={cn(
              'rounded-xl p-4 text-center',
              isIncome
                ? 'bg-emerald-50 dark:bg-emerald-950/30'
                : 'bg-red-50 dark:bg-red-950/30'
            )}
          >
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {isIncome ? 'Pemasukan' : 'Pengeluaran'}
            </p>
            <p
              className={cn(
                'text-2xl font-bold',
                isIncome
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {isIncome ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <DetailRow
              icon={<CalendarIcon className="h-4 w-4" />}
              label="Tanggal"
              value={format(date, 'dd MMMM yyyy')}
            />
            <DetailRow
              icon={<Tag className="h-4 w-4" />}
              label="Kategori"
              value={
                <span className="flex items-center gap-2">
                  <span>{transaction.category?.icon}</span>
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: transaction.category?.color || '#6b7280',
                    }}
                  />
                  {transaction.category?.name || '-'}
                </span>
              }
            />
            <DetailRow
              icon={<CircleDot className="h-4 w-4" />}
              label="Status"
              value={
                <Badge variant="outline" className={cn('text-xs', status.className)}>
                  {status.label}
                </Badge>
              }
            />
            <DetailRow
              icon={<Hash className="h-4 w-4" />}
              label="Deskripsi"
              value={transaction.description || '-'}
            />
            <Separator className="my-2" />
            <DetailRow
              icon={<CalendarIcon className="h-4 w-4" />}
              label="Dibuat"
              value={format(createdDate, 'dd MMM yyyy, HH:mm')}
            />
          </div>

          {/* Proof Image */}
          {transaction.proofImage && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ImageIcon className="h-4 w-4" />
                Bukti Transaksi
              </div>
              <div className="rounded-xl border overflow-hidden">
                <img
                  src={transaction.proofImage}
                  alt="Bukti transaksi"
                  className="w-full max-h-60 object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-foreground mt-0.5">
          {value}
        </div>
      </div>
    </div>
  )
}
