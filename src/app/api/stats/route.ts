import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

// GET /api/stats - Get financial statistics (optimized)
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

    // Run all independent queries in parallel
    const [
      incomeThisMonth,
      expenseThisMonth,
      allMonthTransactions,
      allYearTransactions,
      categoryBreakdown,
      recentTransactions,
    ] = await Promise.all([
      // Total income this month
      db.transaction.aggregate({
        where: {
          userId: user.id,
          type: "income",
          status: "completed",
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),

      // Total expense this month
      db.transaction.aggregate({
        where: {
          userId: user.id,
          type: "expense",
          status: "completed",
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),

      // All completed transactions this month (for daily stats)
      db.transaction.findMany({
        where: {
          userId: user.id,
          status: "completed",
          date: { gte: monthStart, lte: monthEnd },
        },
        select: {
          type: true,
          amount: true,
          date: true,
        },
        orderBy: { date: "asc" },
      }),

      // All completed transactions this year (for monthly stats)
      db.transaction.findMany({
        where: {
          userId: user.id,
          status: "completed",
          date: {
            gte: new Date(currentYear, 0, 1),
            lte: new Date(currentYear, 11, 31, 23, 59, 59, 999),
          },
        },
        select: {
          type: true,
          amount: true,
          date: true,
        },
        orderBy: { date: "asc" },
      }),

      // Category breakdown (current month)
      db.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId: user.id,
          status: "completed",
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),

      // Recent transactions (last 5)
      db.transaction.findMany({
        where: { userId: user.id },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ]);

    // Process daily stats from the month's transactions
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyStatsMap = new Map<string, { income: number; expense: number }>();

    // Initialize all days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(currentYear, currentMonth, day)
        .toISOString()
        .split("T")[0];
      dailyStatsMap.set(dateStr, { income: 0, expense: 0 });
    }

    // Aggregate from fetched transactions
    for (const tx of allMonthTransactions) {
      const dateStr = new Date(tx.date).toISOString().split("T")[0];
      const existing = dailyStatsMap.get(dateStr);
      if (existing) {
        if (tx.type === "income") {
          existing.income += tx.amount;
        } else {
          existing.expense += tx.amount;
        }
      }
    }

    const dailyStats = Array.from(dailyStatsMap.entries()).map(
      ([dateStr, data], index) => ({
        date: dateStr,
        day: index + 1,
        income: data.income,
        expense: data.expense,
      })
    );

    // Process monthly stats from the year's transactions
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];

    const monthlyStatsMap = new Map<number, { income: number; expense: number }>();

    // Initialize months up to current month
    for (let m = 0; m <= currentMonth; m++) {
      monthlyStatsMap.set(m, { income: 0, expense: 0 });
    }

    // Aggregate from fetched transactions
    for (const tx of allYearTransactions) {
      const txMonth = new Date(tx.date).getMonth();
      const existing = monthlyStatsMap.get(txMonth);
      if (existing) {
        if (tx.type === "income") {
          existing.income += tx.amount;
        } else {
          existing.expense += tx.amount;
        }
      }
    }

    const monthlyStats = Array.from(monthlyStatsMap.entries()).map(
      ([monthIndex, data]) => ({
        month: monthNames[monthIndex],
        monthIndex,
        income: data.income,
        expense: data.expense,
      })
    );

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
