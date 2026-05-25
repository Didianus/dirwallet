import { create } from 'zustand'

export type ActiveView = 'dashboard' | 'transactions' | 'add-transaction' | 'categories' | 'admin' | 'settings'

interface AppState {
  activeView: ActiveView
  sidebarOpen: boolean
  setActiveView: (view: ActiveView) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()((set) => ({
  activeView: 'dashboard',
  sidebarOpen: true,

  setActiveView: (view: ActiveView) => {
    set({ activeView: view })
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open })
  },
}))
