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
  ImageIcon,
} from 'lucide-react'
import { format } from 'date-fns'

import { useTransactionStore } from '@/store/transaction-store'
import { useCategoryStore } from '@/store/category-store'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { toast } from 'sonner'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  date: z.string().min(1, 'Tanggal wajib dipilih'),
  status: z.enum(['completed', 'pending']),
  proofImage: z.string().nullable().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

export function AddTransaction() {
  const { addTransaction, isLoading } = useTransactionStore()
  const { categories, fetchCategories } = useCategoryStore()
  const { setActiveView } = useAppStore()
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [proofPreview, setProofPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const filteredCategories = categories.filter((c) => c.type === transactionType)

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: undefined,
      description: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      proofImage: null,
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form

  const watchDate = watch('date')

  const handleTypeChange = (type: 'income' | 'expense') => {
    setTransactionType(type)
    setValue('type', type)
    setValue('categoryId', '')
  }

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

  const onSubmit = async (data: TransactionFormData) => {
    if (!data.amount || data.amount <= 0) {
      toast.error('Jumlah harus lebih dari 0')
      return
    }

    const result = await addTransaction({
      type: data.type,
      amount: data.amount,
      description: data.description,
      categoryId: data.categoryId,
      date: data.date,
      status: data.status,
      proofImage: data.proofImage,
    })

    if (result) {
      toast.success(
        data.type === 'income'
          ? 'Pemasukan berhasil ditambahkan!'
          : 'Pengeluaran berhasil ditambahkan!'
      )
      reset()
      setProofPreview(null)
      setTransactionType('expense')
      setActiveView('transactions')
    } else {
      const error = useTransactionStore.getState().error
      toast.error(error || 'Gagal menambahkan transaksi. Silakan coba lagi.')
    }
  }

  const isIncome = transactionType === 'income'
  const accentColor = isIncome ? 'emerald' : 'red'

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Tambah Transaksi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Catat pemasukan atau pengeluaran baru
          </p>
        </div>

        {/* Type Toggle */}
        <div className="mb-6">
          <div className="relative flex rounded-xl bg-muted p-1">
            <motion.div
              className={cn(
                'absolute inset-y-1 rounded-lg shadow-sm transition-all',
                isIncome
                  ? 'left-1 right-1/2 bg-emerald-500'
                  : 'left-1/2 right-1 bg-red-500'
              )}
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
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
              onClick={() => handleTypeChange('expense')}
              className={cn(
                'relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
                !isIncome ? 'text-white' : 'text-muted-foreground'
              )}
            >
              <ArrowDownRight className="h-4 w-4" />
              Pengeluaran
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div
          className={cn(
            'rounded-2xl border bg-card p-6 shadow-sm',
            isIncome
              ? 'border-emerald-200 dark:border-emerald-800/50'
              : 'border-red-200 dark:border-red-800/50'
          )}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Amount */}
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className={cn(
                  'text-sm font-medium',
                  isIncome
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-red-700 dark:text-red-300'
                )}
              >
                Jumlah
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  className="pl-10 text-lg font-semibold h-12"
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Deskripsi
              </Label>
              <Textarea
                id="description"
                placeholder={
                  isIncome
                    ? 'Contoh: Gaji bulan Maret'
                    : 'Contoh: Makan siang di restoran'
                }
                className="resize-none"
                rows={3}
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
              <Label className="text-sm font-medium">Kategori</Label>
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
                  {filteredCategories.length === 0 && (
                    <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                      Belum ada kategori
                    </div>
                  )}
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
              <Label className="text-sm font-medium">Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-10',
                      !watchDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchDate
                      ? format(new Date(watchDate), 'dd MMMM yyyy', { locale: undefined })
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
              <Label className="text-sm font-medium">Status</Label>
              <Select
                onValueChange={(value: 'completed' | 'pending') =>
                  setValue('status', value)
                }
                defaultValue="completed"
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="pending">Tertunda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Proof Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Bukti Transaksi{' '}
                <span className="text-muted-foreground">(opsional)</span>
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
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeProof}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="h-4 w-4" />
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
                      htmlFor="proof-upload"
                      className={cn(
                        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors',
                        isIncome
                          ? 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20'
                          : 'border-red-200 hover:border-red-400 hover:bg-red-50/50 dark:border-red-800 dark:hover:border-red-600 dark:hover:bg-red-950/20'
                      )}
                    >
                      <Upload
                        className={cn(
                          'h-8 w-8 mb-2',
                          isIncome
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        )}
                      />
                      <p className="text-sm font-medium text-foreground">
                        Klik untuk upload bukti
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, max 5MB
                      </p>
                      <input
                        id="proof-upload"
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full h-12 text-base font-semibold rounded-xl transition-all',
                isIncome
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  {isIncome ? (
                    <ArrowUpRight className="mr-2 h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="mr-2 h-5 w-5" />
                  )}
                  {isIncome ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
