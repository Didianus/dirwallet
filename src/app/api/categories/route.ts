import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

// GET /api/categories - List categories for current user
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
    const type = searchParams.get("type") || "";

    const where: {
      userId: string;
      type?: string;
    } = {
      userId: user.id,
    };

    if (type) {
      where.type = type;
    }

    const categories = await db.category.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create custom category
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
    const { name, icon, color, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Nama dan tipe kategori harus diisi" },
        { status: 400 }
      );
    }

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json(
        { error: "Tipe harus income atau expense" },
        { status: 400 }
      );
    }

    // Check if category with same name already exists for this user
    const existingCategory = await db.category.findFirst({
      where: { name, userId: user.id },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Kategori dengan nama tersebut sudah ada" },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        icon: icon || "📦",
        color: color || "#6b7280",
        type,
        isDefault: false,
        userId: user.id,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
