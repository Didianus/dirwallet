import { create } from 'zustand'
import type { Transaction, TransactionFilters, CreateTransactionData } from '@/types'

interface TransactionState {
  transactions: Transaction[]
  totalCount: number
  currentPage: number
  totalPages: number
  isLoading: boolean
  error: string | null
  filters: TransactionFilters
  setFilters: (filters: Partial<TransactionFilters>) => void
  resetFilters: () => void
  fetchTransactions: (page?: number) => Promise<void>
  addTransaction: (data: CreateTransactionData) => Promise<boolean>
  updateTransaction: (id: string, data: Partial<CreateTransactionData>) => Promise<boolean>
  deleteTransaction: (id: string) => Promise<boolean>
}

const defaultFilters: TransactionFilters = {
  search: '',
  type: '',
  categoryId: '',
  startDate: '',
  endDate: '',
  status: '',
}

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  transactions: [],
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  filters: { ...defaultFilters },

  setFilters: (newFilters: Partial<TransactionFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters } })
  },

  fetchTransactions: async (page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const { filters } = get()
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '10')

      if (filters.search) params.set('search', filters.search)
      if (filters.type) params.set('type', filters.type)
      if (filters.categoryId) params.set('categoryId', filters.categoryId)
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate) params.set('endDate', filters.endDate)
      if (filters.status) params.set('status', filters.status)

      const res = await fetch(`/api/transactions?${params.toString()}`)

      if (!res.ok) {
        set({ isLoading: false, error: 'Gagal mengambil data transaksi' })
        return
      }

      const data = await res.json()

      // API returns { transactions, pagination: { page, limit, total, totalPages } }
      const transactions = data.transactions || []
      const pagination = data.pagination || {}

      set({
        transactions,
        totalCount: pagination.total || 0,
        currentPage: pagination.page || page,
        totalPages: pagination.totalPages || 1,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false, error: 'Kesalahan jaringan. Silakan coba lagi.' })
    }
  },

  addTransaction: async (data: CreateTransactionData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const responseData = await res.json().catch(() => ({}))

      if (!res.ok) {
        set({ isLoading: false, error: responseData.error || 'Gagal menambahkan transaksi' })
        return false
      }

      set({ isLoading: false })
      // Refresh the list
      await get().fetchTransactions(get().currentPage)
      return true
    } catch {
      set({ isLoading: false, error: 'Kesalahan jaringan. Silakan coba lagi.' })
      return false
    }
  },

  updateTransaction: async (id: string, data: Partial<CreateTransactionData>) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const responseData = await res.json().catch(() => ({}))

      if (!res.ok) {
        set({ isLoading: false, error: responseData.error || 'Gagal memperbarui transaksi' })
        return false
      }

      set({ isLoading: false })
      // Refresh the list
      await get().fetchTransactions(get().currentPage)
      return true
    } catch {
      set({ isLoading: false, error: 'Kesalahan jaringan. Silakan coba lagi.' })
      return false
    }
  },

  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      const responseData = await res.json().catch(() => ({}))

      if (!res.ok) {
        set({ isLoading: false, error: responseData.error || 'Gagal menghapus transaksi' })
        return false
      }

      set({ isLoading: false })
      // Refresh the list
      await get().fetchTransactions(get().currentPage)
      return true
    } catch {
      set({ isLoading: false, error: 'Kesalahan jaringan. Silakan coba lagi.' })
      return false
    }
  },
}))
