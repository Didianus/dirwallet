'use client'

import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number
  trend?: {
    value: number
    isPositive: boolean
  }
  gradient?: string
  glassmorphism?: boolean
  iconColor?: string
  delay?: number
  isCurrency?: boolean
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  gradient,
  glassmorphism = false,
  iconColor = 'text-white',
  delay = 0,
  isCurrency = true,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'rounded-2xl p-5 shadow-lg transition-all duration-300 hover:shadow-xl',
        gradient ? gradient : 'bg-card border border-border',
        glassmorphism && 'bg-white/10 backdrop-blur-md border border-white/20'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p
            className={cn(
              'text-sm font-medium',
              gradient || glassmorphism
                ? 'text-white/80'
                : 'text-muted-foreground'
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              'text-2xl font-bold tracking-tight',
              gradient || glassmorphism ? 'text-white' : 'text-foreground'
            )}
          >
            {isCurrency ? formatCurrency(value) : value.toLocaleString('id-ID')}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span
                className={cn(
                  'text-xs',
                  gradient || glassmorphism
                    ? 'text-white/60'
                    : 'text-muted-foreground'
                )}
              >
                vs bulan lalu
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            gradient || glassmorphism
              ? 'bg-white/20'
              : 'bg-primary/10'
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
    </motion.div>
  )
}

interface MiniStatCardProps {
  icon: LucideIcon
  label: string
  value: number
  accentColor: 'green' | 'red'
  delay?: number
}

export function MiniStatCard({
  icon: Icon,
  label,
  value,
  accentColor,
  delay = 0,
}: MiniStatCardProps) {
  const colorClasses = {
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-700 dark:text-emerald-300',
      accent: 'border-l-4 border-l-emerald-500',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800/50',
      iconBg: 'bg-red-100 dark:bg-red-900/50',
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-700 dark:text-red-300',
      accent: 'border-l-4 border-l-red-500',
    },
  }

  const colors = colorClasses[accentColor]

  return (
    <motion.div
      initial={{ opacity: 0, x: accentColor === 'green' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md',
        colors.bg,
        colors.border,
        colors.accent
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            colors.iconBg
          )}
        >
          <Icon className={cn('h-5 w-5', colors.iconColor)} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className={cn('text-lg font-bold', colors.valueColor)}>
            {formatCurrency(value)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
