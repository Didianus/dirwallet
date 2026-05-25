import { create } from 'zustand'
import type { Wallet } from '@/types'

interface WalletState {
  wallet: Wallet | null
  isLoading: boolean
  error: string | null
  fetchWallet: () => Promise<void>
}

export const useWalletStore = create<WalletState>()((set) => ({
  wallet: null,
  isLoading: false,
  error: null,

  fetchWallet: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/wallet')

      if (!res.ok) {
        set({ isLoading: false, error: 'Gagal mengambil data wallet' })
        return
      }

      const data = await res.json()

      // API returns { wallet }
      if (data.wallet) {
        set({ wallet: data.wallet, isLoading: false })
      } else {
        set({ isLoading: false, error: 'Wallet tidak ditemukan' })
      }
    } catch {
      set({ isLoading: false, error: 'Kesalahan jaringan. Silakan coba lagi.' })
    }
  },
}))
