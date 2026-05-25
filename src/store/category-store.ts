import { create } from 'zustand'
import type { Category, CreateCategoryData } from '@/types'

interface CategoryState {
  categories: Category[]
  isLoading: boolean
  error: string | null
  fetchCategories: (type?: string) => Promise<void>
  addCategory: (data: CreateCategoryData) => Promise<boolean>
  updateCategory: (id: string, data: Partial<CreateCategoryData>) => Promise<boolean>
  deleteCategory: (id: string) => Promise<boolean>
}

export const useCategoryStore = create<CategoryState>()((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (type?: string) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams()
      if (type) params.set('type', type)

      const url = type ? `/api/categories?${params.toString()}` : '/api/categories'
      const res = await fetch(url)

      if (!res.ok) {
        set({ isLoading: false, error: 'Gagal mengambil data kategori' })
        return
      }

      const data = await res.json()

      // API returns { categories }
      set({ categories: data.categories || [], isLoading: false })
    } catch {
      set({ isLoading: false, error: 'Kesalahan jaringan. Silakan coba lagi.' })
    }
  },

  addCategory: async (data: CreateCategoryData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const responseData = await res.json().catch(() => ({}))

      if (!res.ok) {
        set({ isLoading: false, error: responseData.error || 'Gagal menambahkan kategori' })
        return false
      }

      set({ isLoading: false })
      // Refresh the list
      await get().fetchCategories()
      return true
    } catch {
      set({ isLoading: false, error: 'Kesalahan jaringan. Silakan coba lagi.' })
      return false
    }
  },

  updateCategory: async (id: string, data: Partial<CreateCategoryData>) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const responseData = await res.json().catch(() => ({}))

      if (!res.ok) {
        set({ isLoading: false, error: responseData.error || 'Gagal memperbarui kategori' })
        return false
      }

      set({ isLoading: false })
      // Refresh the list
      await get().fetchCategories()
      return true
    } catch {
      set({ isLoading: false, error: 'Kesalahan jaringan. Silakan coba lagi.' })
      return false
    }
  },

  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      const responseData = await res.json().catch(() => ({}))

      if (!res.ok) {
        set({ isLoading: false, error: responseData.error || 'Gagal menghapus kategori' })
        return false
      }

      set({ isLoading: false })
      // Refresh the list
      await get().fetchCategories()
      return true
    } catch {
      set({ isLoading: false, error: 'Kesalahan jaringan. Silakan coba lagi.' })
      return false
    }
  },
}))
