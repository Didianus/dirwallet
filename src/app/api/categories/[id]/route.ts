import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

// PUT /api/categories/[id] - Update category
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
    const { name, icon, color, type } = body;

    // Check category belongs to user
    const existingCategory = await db.category.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    if (type && !["income", "expense"].includes(type)) {
      return NextResponse.json(
        { error: "Tipe harus income atau expense" },
        { status: 400 }
      );
    }

    // Check for duplicate name if name is being changed
    if (name && name !== existingCategory.name) {
      const duplicate = await db.category.findFirst({
        where: { name, userId: user.id },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Kategori dengan nama tersebut sudah ada" },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(icon && { icon }),
        ...(color && { color }),
        ...(type && { type }),
      },
    });

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category (only if no transactions use it)
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

    // Check category belongs to user
    const existingCategory = await db.category.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if any transactions use this category
    const transactionCount = await db.transaction.count({
      where: { categoryId: id },
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: "Kategori tidak dapat dihapus karena masih digunakan oleh transaksi" },
        { status: 400 }
      );
    }

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
