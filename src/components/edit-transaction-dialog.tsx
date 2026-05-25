'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight,
  ArrowDownRight,
  CalendarIcon,
  Upload,
  X,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'

import { useTransactionStore } from '@/store/transaction-store'
import { useCategoryStore } from '@/store/category-store'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { toast } from 'sonner'

const editSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().min(1, 'Jumlah harus lebih dari 0'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  date: z.string().min(1, 'Tanggal wajib dipilih'),
  status: z.enum(['completed', 'pending', 'cancelled']),
  proofImage: z.string().nullable().optional(),
})

type EditFormData = z.infer<typeof editSchema>

interface EditTransactionDialogProps {
  transaction: Transaction | null
  open: boolean
  onClose: () => void
}

export function EditTransactionDialog({
  transaction,
  open,
  onClose,
}: EditTransactionDialogProps) {
  const { updateTransaction, isLoading } = useTransactionStore()
  const { categories, fetchCategories } = useCategoryStore()
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [proofPreview, setProofPreview] = useState<string | null>(null)

  useEffect(() => {
    if (open && transaction) {
      fetchCategories()
      setTransactionType(transaction.type as 'income' | 'expense')
      setProofPreview(transaction.proofImage)
    }
  }, [open, transaction, fetchCategories])

  const filteredCategories = categories.filter((c) => c.type === transactionType)

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    values: transaction
      ? {
          type: transaction.type as 'income' | 'expense',
          amount: transaction.amount,
          description: transaction.description,
          categoryId: transaction.categoryId,
          date: transaction.date
            ? new Date(transaction.date).toISOString().split('T')[0]
            : '',
          status: transaction.status as 'completed' | 'pending' | 'cancelled',
          proofImage: transaction.proofImage,
        }
      : undefined,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const watchDate = watch('date')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setValue('proofImage', base64)
      setProofPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const removeProof = () => {
    setValue('proofImage', null)
    setProofPreview(null)
  }

  const onSubmit = async (data: EditFormData) => {
    if (!transaction) return

    const result = await updateTransaction(transaction.id, {
      type: data.type,
      amount: data.amount,
      description: data.description,
      categoryId: data.categoryId,
      date: data.date,
      status: data.status,
      proofImage: data.proofImage,
    })

    if (result) {
      toast.success('Transaksi berhasil diperbarui!')
      onClose()
    } else {
      toast.error('Gagal memperbarui transaksi. Silakan coba lagi.')
    }
  }

  const isIncome = transactionType === 'income'

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isIncome ? (
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            )}
            Edit Transaksi
          </DialogTitle>
          <DialogDescription>
            Ubah detail transaksi Anda
          </DialogDescription>
        </DialogHeader>

        {/* Type Toggle */}
        <div className="relative flex rounded-xl bg-muted p-1">
          <motion.div
            className={cn(
              'absolute inset-y-1 rounded-lg shadow-sm',
              isIncome
                ? 'left-1 right-1/2 bg-emerald-500'
                : 'left-1/2 right-1 bg-red-500'
            )}
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
          <button
            type="button"
            onClick={() => {
              setTransactionType('income')
              setValue('type', 'income')
              setValue('categoryId', '')
            }}
            className={cn(
              'relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isIncome ? 'text-white' : 'text-muted-foreground'
            )}
          >
            <ArrowUpRight className="h-4 w-4" />
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => {
              setTransactionType('expense')
              setValue('type', 'expense')
              setValue('categoryId', '')
            }}
            className={cn(
              'relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
              !isIncome ? 'text-white' : 'text-muted-foreground'
            )}
          >
            <ArrowDownRight className="h-4 w-4" />
            Pengeluaran
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Jumlah</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                Rp
              </span>
              <Input
                id="edit-amount"
                type="number"
                placeholder="0"
                className="pl-10 text-lg font-semibold h-12"
                {...register('amount')}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Deskripsi</Label>
            <Textarea
              id="edit-description"
              placeholder="Deskripsi transaksi"
              className="resize-none"
              rows={2}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              onValueChange={(value) => setValue('categoryId', value)}
              value={watch('categoryId')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !watchDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchDate
                    ? format(new Date(watchDate), 'dd MMMM yyyy')
                    : 'Pilih tanggal'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchDate ? new Date(watchDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setValue('date', date.toISOString().split('T')[0])
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              onValueChange={(value: 'completed' | 'pending' | 'cancelled') =>
                setValue('status', value)
              }
              value={watch('status')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="pending">Tertunda</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Proof Image Upload */}
          <div className="space-y-2">
            <Label>
              Bukti Transaksi <span className="text-muted-foreground">(opsional)</span>
            </Label>
            <AnimatePresence mode="wait">
              {proofPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative rounded-xl border overflow-hidden"
                >
                  <img
                    src={proofPreview}
                    alt="Bukti transaksi"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeProof}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <label
                    htmlFor="edit-proof-upload"
                    className={cn(
                      'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors',
                      'border-muted hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20'
                    )}
                  >
                    <Upload className="h-6 w-6 mb-1 text-muted-foreground" />
                    <p className="text-xs font-medium">Upload bukti</p>
                    <input
                      id="edit-proof-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                'flex-1 font-semibold',
                isIncome
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
