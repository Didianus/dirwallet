import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

// GET /api/transactions - List transactions with pagination, search, filter
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "date_desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      userId: string;
      description?: { contains: string };
      type?: string;
      categoryId?: string;
      status?: string;
      date?: { gte?: Date; lte?: Date };
    } = {
      userId: user.id,
    };

    if (search) {
      where.description = { contains: search };
    }

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Build order by
    const orderBy: Record<string, string> = {};
    switch (sort) {
      case "date_asc":
        orderBy.date = "asc";
        break;
      case "amount_desc":
        orderBy.amount = "desc";
        break;
      case "amount_asc":
        orderBy.amount = "asc";
        break;
      case "date_desc":
      default:
        orderBy.date = "desc";
        break;
    }

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create transaction
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, amount, description, categoryId, date, status, proofImage } = body;

    // Validate required fields
    if (!type || !amount || !description || !categoryId || !date) {
      return NextResponse.json(
        { error: "Tipe, jumlah, deskripsi, kategori, dan tanggal harus diisi" },
        { status: 400 }
      );
    }

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json(
        { error: "Tipe harus income atau expense" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Jumlah harus lebih dari 0" },
        { status: 400 }
      );
    }

    // Get user's wallet
    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify category belongs to user
    const category = await db.category.findFirst({
      where: { id: categoryId, userId: user.id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    // Create transaction and update wallet balance atomically
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          type,
          amount,
          description,
          categoryId,
          walletId: wallet.id,
          userId: user.id,
          date: new Date(date),
          status: status || "completed",
          proofImage: proofImage || null,
        },
        include: {
          category: true,
        },
      });

      // Update wallet balance
      const balanceChange = type === "income" ? amount : -amount;
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: balanceChange } },
      });

      return newTransaction;
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
