'use client'

import { Loader2, Trash2 } from 'lucide-react'

import type { Transaction } from '@/types'
import { formatCurrency, cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface DeleteConfirmationDialogProps {
  transaction: Transaction | null
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

export function DeleteConfirmationDialog({
  transaction,
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  if (!transaction) return null

  const isIncome = transaction.type === 'income'

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Hapus Transaksi
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini
              tidak dapat dibatalkan.
            </p>
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {transaction.description || transaction.category?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.category?.icon}{' '}
                    {transaction.category?.name}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold ml-3',
                    isIncome
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
