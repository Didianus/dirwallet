import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

// GET /api/admin/stats - System-wide statistics (admin only)
export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya admin yang dapat mengakses." },
        { status: 403 }
      );
    }

    // Current date info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // Total users
    const totalUsers = await db.user.count();

    // Total transactions
    const totalTransactions = await db.transaction.count();

    // Total balance in system
    const totalBalance = await db.wallet.aggregate({
      _sum: { balance: true },
    });

    // New users this month
    const newUsersThisMonth = await db.user.count({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    });

    // Transactions this month
    const transactionsThisMonth = await db.transaction.count({
      where: {
        date: { gte: monthStart, lte: monthEnd },
      },
    });

    // Total income in system
    const totalIncome = await db.transaction.aggregate({
      where: { type: "income" },
      _sum: { amount: true },
    });

    // Total expense in system
    const totalExpense = await db.transaction.aggregate({
      where: { type: "expense" },
      _sum: { amount: true },
    });

    return NextResponse.json({
      totalUsers,
      totalTransactions,
      totalBalance: totalBalance._sum.balance || 0,
      newUsersThisMonth,
      transactionsThisMonth,
      totalIncome: totalIncome._sum.amount || 0,
      totalExpense: totalExpense._sum.amount || 0,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
