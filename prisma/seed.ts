import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@finwallet.com' },
    update: {},
    create: {
      email: 'admin@finwallet.com',
      name: 'Admin FinWallet',
      password: adminPassword,
      role: 'admin',
      wallet: {
        create: { balance: 5000000 },
      },
      categories: {
        create: [
          { name: 'Makanan 🍔', icon: '🍔', color: '#f97316', type: 'expense', isDefault: true },
          { name: 'Transportasi 🚗', icon: '🚗', color: '#3b82f6', type: 'expense', isDefault: true },
          { name: 'Belanja 🛍️', icon: '🛍️', color: '#ec4899', type: 'expense', isDefault: true },
          { name: 'Tagihan 📋', icon: '📋', color: '#8b5cf6', type: 'expense', isDefault: true },
          { name: 'Hiburan 🎬', icon: '🎬', color: '#ef4444', type: 'expense', isDefault: true },
          { name: 'Kesehatan 💊', icon: '💊', color: '#10b981', type: 'expense', isDefault: true },
          { name: 'Pendidikan 📚', icon: '📚', color: '#6366f1', type: 'expense', isDefault: true },
          { name: 'Lainnya 📦', icon: '📦', color: '#6b7280', type: 'expense', isDefault: true },
          { name: 'Gaji 💰', icon: '💰', color: '#22c55e', type: 'income', isDefault: true },
          { name: 'Bonus 🎁', icon: '🎁', color: '#f59e0b', type: 'income', isDefault: true },
          { name: 'Investasi 📈', icon: '📈', color: '#14b8a6', type: 'income', isDefault: true },
          { name: 'Freelance 💻', icon: '💻', color: '#0ea5e9', type: 'income', isDefault: true },
          { name: 'Lainnya 💵', icon: '💵', color: '#6b7280', type: 'income', isDefault: true },
        ],
      },
    },
    include: { wallet: true, categories: true },
  })

  // Create demo user
  const userPassword = await bcrypt.hash('user123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@finwallet.com' },
    update: {},
    create: {
      email: 'user@finwallet.com',
      name: 'Demo User',
      password: userPassword,
      role: 'user',
      wallet: {
        create: { balance: 2500000 },
      },
      categories: {
        create: [
          { name: 'Makanan 🍔', icon: '🍔', color: '#f97316', type: 'expense', isDefault: true },
          { name: 'Transportasi 🚗', icon: '🚗', color: '#3b82f6', type: 'expense', isDefault: true },
          { name: 'Belanja 🛍️', icon: '🛍️', color: '#ec4899', type: 'expense', isDefault: true },
          { name: 'Tagihan 📋', icon: '📋', color: '#8b5cf6', type: 'expense', isDefault: true },
          { name: 'Hiburan 🎬', icon: '🎬', color: '#ef4444', type: 'expense', isDefault: true },
          { name: 'Kesehatan 💊', icon: '💊', color: '#10b981', type: 'expense', isDefault: true },
          { name: 'Pendidikan 📚', icon: '📚', color: '#6366f1', type: 'expense', isDefault: true },
          { name: 'Lainnya 📦', icon: '📦', color: '#6b7280', type: 'expense', isDefault: true },
          { name: 'Gaji 💰', icon: '💰', color: '#22c55e', type: 'income', isDefault: true },
          { name: 'Bonus 🎁', icon: '🎁', color: '#f59e0b', type: 'income', isDefault: true },
          { name: 'Investasi 📈', icon: '📈', color: '#14b8a6', type: 'income', isDefault: true },
          { name: 'Freelance 💻', icon: '💻', color: '#0ea5e9', type: 'income', isDefault: true },
          { name: 'Lainnya 💵', icon: '💵', color: '#6b7280', type: 'income', isDefault: true },
        ],
      },
    },
    include: { wallet: true, categories: true },
  })

  // Create some demo transactions for the admin user
  if (admin.wallet) {
    const adminCategories = admin.categories
    const expenseCats = adminCategories.filter(c => c.type === 'expense')
    const incomeCats = adminCategories.filter(c => c.type === 'income')

    const transactions = [
      { type: 'income', amount: 8000000, description: 'Gaji bulan ini', categoryId: incomeCats.find(c => c.name.includes('Gaji'))!.id, date: new Date(2025, 2, 1) },
      { type: 'expense', amount: 150000, description: 'Makan siang tim', categoryId: expenseCats.find(c => c.name.includes('Makanan'))!.id, date: new Date(2025, 2, 3) },
      { type: 'expense', amount: 50000, description: 'Grab ke kantor', categoryId: expenseCats.find(c => c.name.includes('Transportasi'))!.id, date: new Date(2025, 2, 4) },
      { type: 'income', amount: 2000000, description: 'Bonus proyek', categoryId: incomeCats.find(c => c.name.includes('Bonus'))!.id, date: new Date(2025, 2, 5) },
      { type: 'expense', amount: 500000, description: 'Belanja bulanan', categoryId: expenseCats.find(c => c.name.includes('Belanja'))!.id, date: new Date(2025, 2, 7) },
      { type: 'expense', amount: 350000, description: 'Listrik & Internet', categoryId: expenseCats.find(c => c.name.includes('Tagihan'))!.id, date: new Date(2025, 2, 10) },
      { type: 'income', amount: 1500000, description: 'Freelance project', categoryId: incomeCats.find(c => c.name.includes('Freelance'))!.id, date: new Date(2025, 2, 12) },
      { type: 'expense', amount: 200000, description: 'Nonton bioskop', categoryId: expenseCats.find(c => c.name.includes('Hiburan'))!.id, date: new Date(2025, 2, 14) },
      { type: 'expense', amount: 100000, description: 'Obat flu', categoryId: expenseCats.find(c => c.name.includes('Kesehatan'))!.id, date: new Date(2025, 2, 16) },
      { type: 'income', amount: 500000, description: 'Dividen saham', categoryId: incomeCats.find(c => c.name.includes('Investasi'))!.id, date: new Date(2025, 2, 18) },
    ]

    for (const tx of transactions) {
      await prisma.transaction.create({
        data: {
          ...tx,
          userId: admin.id,
          walletId: admin.wallet.id,
          status: 'completed',
        },
      })
    }
  }

  // Create some demo transactions for the demo user
  if (demoUser.wallet) {
    const userCategories = demoUser.categories
    const expenseCats = userCategories.filter(c => c.type === 'expense')
    const incomeCats = userCategories.filter(c => c.type === 'income')

    const transactions = [
      { type: 'income', amount: 5000000, description: 'Gaji bulanan', categoryId: incomeCats.find(c => c.name.includes('Gaji'))!.id, date: new Date(2025, 2, 1) },
      { type: 'expense', amount: 75000, description: 'Makan di warteg', categoryId: expenseCats.find(c => c.name.includes('Makanan'))!.id, date: new Date(2025, 2, 2) },
      { type: 'expense', amount: 30000, description: 'Ojek online', categoryId: expenseCats.find(c => c.name.includes('Transportasi'))!.id, date: new Date(2025, 2, 3) },
      { type: 'expense', amount: 250000, description: 'Beli baju baru', categoryId: expenseCats.find(c => c.name.includes('Belanja'))!.id, date: new Date(2025, 2, 5) },
      { type: 'income', amount: 800000, description: 'Project side hustle', categoryId: incomeCats.find(c => c.name.includes('Freelance'))!.id, date: new Date(2025, 2, 8) },
      { type: 'expense', amount: 150000, description: 'Tagihan listrik', categoryId: expenseCats.find(c => c.name.includes('Tagihan'))!.id, date: new Date(2025, 2, 10) },
    ]

    for (const tx of transactions) {
      await prisma.transaction.create({
        data: {
          ...tx,
          userId: demoUser.id,
          walletId: demoUser.wallet.id,
          status: 'completed',
        },
      })
    }
  }

  console.log('✅ Seed data created successfully!')
  console.log('')
  console.log('🔑 Login credentials:')
  console.log('   Admin: admin@finwallet.com / admin123')
  console.log('   User:  user@finwallet.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
