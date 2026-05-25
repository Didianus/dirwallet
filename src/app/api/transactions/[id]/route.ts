import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

// GET /api/transactions/[id] - Get single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const transaction = await db.transaction.findFirst({
      where: { id, userId: user.id },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Get transaction error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { type, amount, description, categoryId, date, status, proofImage } = body;

    // Find existing transaction
    const existingTransaction = await db.transaction.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify category if changed
    if (categoryId && categoryId !== existingTransaction.categoryId) {
      const category = await db.category.findFirst({
        where: { id: categoryId, userId: user.id },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Kategori tidak ditemukan" },
          { status: 404 }
        );
      }
    }

    const newType = type || existingTransaction.type;
    const newAmount = amount !== undefined ? amount : existingTransaction.amount;

    if (newType && !["income", "expense"].includes(newType)) {
      return NextResponse.json(
        { error: "Tipe harus income atau expense" },
        { status: 400 }
      );
    }

    if (newAmount !== undefined && newAmount <= 0) {
      return NextResponse.json(
        { error: "Jumlah harus lebih dari 0" },
        { status: 400 }
      );
    }

    // Update transaction and recalculate wallet balance atomically
    const updatedTransaction = await db.$transaction(async (tx) => {
      // Reverse the old transaction effect on wallet
      const oldBalanceChange =
        existingTransaction.type === "income"
          ? -existingTransaction.amount
          : existingTransaction.amount;

      await tx.wallet.update({
        where: { id: existingTransaction.walletId },
        data: { balance: { increment: oldBalanceChange } },
      });

      // Apply the new transaction effect on wallet
      const newBalanceChange = newType === "income" ? newAmount : -newAmount;

      await tx.wallet.update({
        where: { id: existingTransaction.walletId },
        data: { balance: { increment: newBalanceChange } },
      });

      // Update the transaction
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          ...(type && { type }),
          ...(amount !== undefined && { amount }),
          ...(description && { description }),
          ...(categoryId && { categoryId }),
          ...(date && { date: new Date(date) }),
          ...(status && { status }),
          ...(proofImage !== undefined && { proofImage }),
        },
        include: {
          category: true,
        },
      });

      return updated;
    });

    return NextResponse.json({ transaction: updatedTransaction });
  } catch (error) {
    console.error("Update transaction error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find existing transaction
    const existingTransaction = await db.transaction.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete transaction and reverse wallet balance atomically
    await db.$transaction(async (tx) => {
      // Reverse the transaction effect on wallet
      const balanceChange =
        existingTransaction.type === "income"
          ? -existingTransaction.amount
          : existingTransaction.amount;

      await tx.wallet.update({
        where: { id: existingTransaction.walletId },
        data: { balance: { increment: balanceChange } },
      });

      // Delete the transaction
      await tx.transaction.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Transaksi berhasil dihapus" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
