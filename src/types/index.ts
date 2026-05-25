// ============================================================
// E-Wallet / Financial Tracker - Type Definitions
// ============================================================

// --- User Types ---

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  avatar: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
}

// --- Wallet Types ---

export interface Wallet {
  id: string
  balance: number
  userId: string
  createdAt: string
  updatedAt: string
}

// --- Category Types ---

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
  isDefault: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryData {
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
}

// --- Transaction Types ---

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  status: 'completed' | 'pending' | 'cancelled'
  proofImage: string | null
  date: string
  userId: string
  categoryId: string
  walletId: string
  category: Category
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionData {
  type: 'income' | 'expense'
  amount: number
  description: string
  status?: 'completed' | 'pending' | 'cancelled'
  proofImage?: string | null
  date: string
  categoryId: string
}

export interface TransactionFilters {
  search: string
  type: string
  categoryId: string
  startDate: string
  endDate: string
  status: string
}

// --- Financial Stats Types ---

export interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  total: number
  percentage: number
  count: number
}

export interface MonthlyData {
  month: string
  income: number
  expense: number
}

export interface FinancialStats {
  totalIncome: number
  totalExpense: number
  balance: number
  monthlyIncome: number
  monthlyExpense: number
  categoryBreakdown: CategoryBreakdown[]
  monthlyData: MonthlyData[]
  recentTransactions: Transaction[]
  pendingCount: number
  transactionCount: number
}

// --- API Response Types ---

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
}

// --- Auth Types ---

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

// --- Dashboard Stats Types ---

export interface DashboardStats {
  balance: number
  totalIncome: number
  totalExpense: number
  monthlyIncome: number
  monthlyExpense: number
  pendingCount: number
  transactionCount: number
}
