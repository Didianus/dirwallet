'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  FolderOpen,
  Tags,
  Loader2,
} from 'lucide-react'
import { useCategoryStore } from '@/store/category-store'
import type { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

// Preset colors for the color picker
const PRESET_COLORS = [
  '#10b981', '#059669', '#14b8a6', '#0d9488',
  '#f59e0b', '#f97316', '#ef4444', '#dc2626',
  '#8b5cf6', '#a855f7', '#3b82f6', '#6366f1',
  '#ec4899', '#f43f5e', '#84cc16', '#22c55e',
  '#06b6d4', '#0ea5e9', '#64748b', '#78716c',
]

// Common emojis for quick selection
const EMOJI_PRESETS = [
  '🍔', '☕', '🚗', '🏠', '💡', '📱', '🎬', '👕',
  '💊', '📚', '✈️', '🎁', '💰', '💵', '🏦', '📈',
  '🛒', '🎮', '🐕', '🏋️', '🎵', '💄', '🔧', '🚌',
  '🍕', '🎪', '🎯', '💎', '🌟', '🔥', '⭐', '🎉',
]

interface CategoryFormData {
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
}

const defaultFormData: CategoryFormData = {
  name: '',
  icon: '📦',
  color: '#10b981',
  type: 'expense',
}

// Category Card Component
function CategoryCard({
  category,
  onEdit,
  onDelete,
  index,
}: {
  category: Category
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
  index: number
}) {
  const isIncome = category.type === 'income'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
    >
      <Card className="group relative overflow-hidden border-0 shadow-sm transition-all hover:shadow-md dark:bg-card/80">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
              style={{ backgroundColor: `${category.color}18` }}
            >
              {category.icon}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-foreground">
                  {category.name}
                </h4>
                {category.isDefault && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-[10px] px-1.5 py-0 bg-muted text-muted-foreground"
                  >
                    Default
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  className={`text-[10px] px-1.5 py-0 ${
                    isIncome
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  } border-0`}
                >
                  {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                </Badge>
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: category.color }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(category)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {!category.isDefault && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                  onClick={() => onDelete(category)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Category Form Dialog - uses key to remount and reset form state
function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  categoryType,
  onSubmit,
  isLoading,
  dialogKey,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  initialData?: CategoryFormData
  categoryType: 'income' | 'expense'
  onSubmit: (data: CategoryFormData) => Promise<void>
  isLoading: boolean
  dialogKey: number
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" key={dialogKey}>
        <CategoryFormInner
          mode={mode}
          initialData={initialData}
          categoryType={categoryType}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}

// Inner form content - remounted via key to reset state
function CategoryFormInner({
  mode,
  initialData,
  categoryType,
  onSubmit,
  onOpenChange,
  isLoading,
}: {
  mode: 'add' | 'edit'
  initialData?: CategoryFormData
  categoryType: 'income' | 'expense'
  onSubmit: (data: CategoryFormData) => Promise<void>
  onOpenChange: (open: boolean) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData || { ...defaultFormData, type: categoryType }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Nama kategori harus diisi')
      return
    }
    await onSubmit(formData)
    onOpenChange(false)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {mode === 'add' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'add'
            ? 'Buat kategori baru untuk mengelompokkan transaksi Anda.'
            : 'Ubah detail kategori ini.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type selector (only in add mode) */}
        {mode === 'add' && (
          <div className="space-y-2">
            <Label>Tipe Kategori</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-2.5 text-sm font-medium transition-all ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950/30 dark:text-red-400'
                    : 'border-border bg-background text-muted-foreground hover:border-red-300 dark:hover:border-red-700'
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: 'expense' }))
                }
              >
                <TrendingDown className="h-4 w-4" />
                Pengeluaran
              </button>
              <button
                type="button"
                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-2.5 text-sm font-medium transition-all ${
                  formData.type === 'income'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'border-border bg-background text-muted-foreground hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: 'income' }))
                }
              >
                <TrendingUp className="h-4 w-4" />
                Pemasukan
              </button>
            </div>
          </div>
        )}

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="cat-name">Nama Kategori</Label>
          <Input
            id="cat-name"
            placeholder="Contoh: Makanan & Minuman"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Label>Ikon</Label>
          <div className="grid grid-cols-8 gap-1.5">
            {EMOJI_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                  formData.icon === emoji
                    ? 'bg-emerald-100 ring-2 ring-emerald-500 dark:bg-emerald-900/30'
                    : 'hover:bg-muted'
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, icon: emoji }))
                }
              >
                {emoji}
              </button>
            ))}
          </div>
          <Input
            placeholder="Atau ketik emoji/icon lain"
            value={formData.icon}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, icon: e.target.value }))
            }
            className="mt-2"
          />
        </div>

        {/* Color */}
        <div className="space-y-2">
          <Label>Warna</Label>
          <div className="grid grid-cols-10 gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`h-7 w-7 rounded-full transition-all ${
                  formData.color === color
                    ? 'ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-background scale-110'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, color }))
                }
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="color"
              value={formData.color}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, color: e.target.value }))
              }
              className="h-9 w-12 cursor-pointer rounded-lg border"
            />
            <Input
              value={formData.color}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, color: e.target.value }))
              }
              className="flex-1 font-mono text-sm"
              placeholder="#10b981"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isLoading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : null}
            {mode === 'add' ? 'Tambah' : 'Simpan'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

// Loading skeleton
function CategorySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Empty state
function EmptyState({ type }: { type: 'income' | 'expense' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <FolderOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Belum Ada Kategori
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {type === 'expense'
          ? 'Tambahkan kategori pengeluaran untuk mengelompokkan transaksi Anda.'
          : 'Tambahkan kategori pemasukan untuk mengelompokkan transaksi Anda.'}
      </p>
    </div>
  )
}

// Main Component
export function CategoryManagement() {
  const { categories, isLoading, error, fetchCategories, addCategory, updateCategory, deleteCategory } =
    useCategoryStore()
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const filteredCategories = categories.filter(
    (cat) => cat.type === activeTab
  )

  const defaultCategories = filteredCategories.filter((c) => c.isDefault)
  const customCategories = filteredCategories.filter((c) => !c.isDefault)

  const handleAdd = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    const success = await addCategory({
      name: data.name,
      icon: data.icon,
      color: data.color,
      type: data.type,
    })
    setIsSubmitting(false)
    if (success) {
      toast.success('Kategori berhasil ditambahkan!')
    } else {
      toast.error('Gagal menambahkan kategori')
    }
  }

  const handleEdit = async (data: CategoryFormData) => {
    if (!selectedCategory) return
    setIsSubmitting(true)
    const success = await updateCategory(selectedCategory.id, {
      name: data.name,
      icon: data.icon,
      color: data.color,
    })
    setIsSubmitting(false)
    if (success) {
      toast.success('Kategori berhasil diperbarui!')
      setSelectedCategory(null)
    } else {
      toast.error('Gagal memperbarui kategori')
    }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return
    setIsSubmitting(true)
    const success = await deleteCategory(selectedCategory.id)
    setIsSubmitting(false)
    if (success) {
      toast.success('Kategori berhasil dihapus!')
      setSelectedCategory(null)
    } else {
      toast.error('Gagal menghapus kategori. Mungkin masih ada transaksi yang menggunakan kategori ini.')
    }
  }

  const openEditDialog = (cat: Category) => {
    setSelectedCategory(cat)
    setDialogKey((k) => k + 1)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (cat: Category) => {
    setSelectedCategory(cat)
    setDeleteDialogOpen(true)
  }

  const openAddDialog = () => {
    setDialogKey((k) => k + 1)
    setAddDialogOpen(true)
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
            <Tags className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Manajemen Kategori
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola kategori pemasukan dan pengeluaran Anda
          </p>
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={openAddDialog}
            >
              <Plus className="h-4 w-4" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <CategoryFormDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            mode="add"
            categoryType={activeTab}
            onSubmit={handleAdd}
            isLoading={isSubmitting}
            dialogKey={dialogKey}
          />
        </Dialog>
      </motion.div>

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'expense' | 'income')}
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="expense" className="gap-1.5">
              <TrendingDown className="h-4 w-4" />
              Pengeluaran
            </TabsTrigger>
            <TabsTrigger value="income" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Pemasukan
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Loading */}
      {isLoading && categories.length === 0 ? (
        <CategorySkeleton />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Default Categories */}
            {defaultCategories.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Kategori Default
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {defaultCategories.map((cat, index) => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Custom Categories */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Kategori Kustom
              </h3>
              {customCategories.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {customCategories.map((cat, index) => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <EmptyState type={activeTab} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Edit Dialog */}
      {selectedCategory && (
        <CategoryFormDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open)
            if (!open) setSelectedCategory(null)
          }}
          mode="edit"
          initialData={{
            name: selectedCategory.name,
            icon: selectedCategory.icon,
            color: selectedCategory.color,
            type: selectedCategory.type,
          }}
          categoryType={selectedCategory.type}
          onSubmit={handleEdit}
          isLoading={isSubmitting}
          dialogKey={dialogKey}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setSelectedCategory(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori &quot;{selectedCategory?.name}&quot;?
              Kategori yang memiliki transaksi terkait tidak dapat dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
