import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

// GET /api/stats - Get financial statistics
export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Get wallet
    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet tidak ditemukan" },
        { status: 404 }
      );
    }

    // Current date info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Start and end of current month
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // Start and end of current year
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    // Total income this month
    const incomeThisMonth = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "income",
        status: "completed",
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    // Total expense this month
    const expenseThisMonth = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "expense",
        status: "completed",
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    // Daily stats for current month (for chart)
    const dailyStats = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(currentYear, currentMonth, day);
      const dayEnd = new Date(currentYear, currentMonth, day, 23, 59, 59, 999);

      const dayIncome = await db.transaction.aggregate({
        where: {
          userId: user.id,
          type: "income",
          status: "completed",
          date: { gte: dayStart, lte: dayEnd },
        },
        _sum: { amount: true },
      });

      const dayExpense = await db.transaction.aggregate({
        where: {
          userId: user.id,
          type: "expense",
          status: "completed",
          date: { gte: dayStart, lte: dayEnd },
        },
        _sum: { amount: true },
      });

      dailyStats.push({
        date: dayStart.toISOString().split("T")[0],
        day,
        income: dayIncome._sum.amount || 0,
        expense: dayExpense._sum.amount || 0,
      });
    }

    // Monthly stats for current year (for chart)
    const monthlyStats = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];

    for (let month = 0; month <= currentMonth; month++) {
      const mStart = new Date(currentYear, month, 1);
      const mEnd = new Date(currentYear, month + 1, 0, 23, 59, 59, 999);

      const mIncome = await db.transaction.aggregate({
        where: {
          userId: user.id,
          type: "income",
          status: "completed",
          date: { gte: mStart, lte: mEnd },
        },
        _sum: { amount: true },
      });

      const mExpense = await db.transaction.aggregate({
        where: {
          userId: user.id,
          type: "expense",
          status: "completed",
          date: { gte: mStart, lte: mEnd },
        },
        _sum: { amount: true },
      });

      monthlyStats.push({
        month: monthNames[month],
        monthIndex: month,
        income: mIncome._sum.amount || 0,
        expense: mExpense._sum.amount || 0,
      });
    }

    // Category breakdown (for pie chart) - current month
    const categoryBreakdown = await db.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: user.id,
        status: "completed",
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    // Get category details for breakdown
    const categoriesWithAmount = await Promise.all(
      categoryBreakdown.map(async (item) => {
        const category = await db.category.findUnique({
          where: { id: item.categoryId },
        });
        return {
          categoryId: item.categoryId,
          categoryName: category?.name || "Unknown",
          categoryIcon: category?.icon || "📦",
          categoryColor: category?.color || "#6b7280",
          categoryType: category?.type || "expense",
          amount: item._sum.amount || 0,
        };
      })
    );

    // Recent transactions (last 5)
    const recentTransactions = await db.transaction.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 5,
    });

    return NextResponse.json({
      totalBalance: wallet.balance,
      totalIncomeThisMonth: incomeThisMonth._sum.amount || 0,
      totalExpenseThisMonth: expenseThisMonth._sum.amount || 0,
      dailyStats,
      monthlyStats,
      categoryBreakdown: categoriesWithAmount,
      recentTransactions,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
