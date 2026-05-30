import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // VALIDASI
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password harus diisi" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 },
      );
    }

    // CHECK EMAIL
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 },
      );
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 12);

    // DEFAULT CATEGORIES
    const defaultCategories = [
      // EXPENSE
      {
        name: "Makanan 🍔",
        icon: "🍔",
        color: "#f97316",
        type: "expense",
      },
      {
        name: "Transportasi 🚗",
        icon: "🚗",
        color: "#3b82f6",
        type: "expense",
      },
      {
        name: "Belanja 🛍️",
        icon: "🛍️",
        color: "#ec4899",
        type: "expense",
      },
      {
        name: "Tagihan 📋",
        icon: "📋",
        color: "#8b5cf6",
        type: "expense",
      },
      {
        name: "Hiburan 🎬",
        icon: "🎬",
        color: "#ef4444",
        type: "expense",
      },
      {
        name: "Kesehatan 💊",
        icon: "💊",
        color: "#10b981",
        type: "expense",
      },
      {
        name: "Pendidikan 📚",
        icon: "📚",
        color: "#6366f1",
        type: "expense",
      },
      {
        name: "Lainnya 📦",
        icon: "📦",
        color: "#6b7280",
        type: "expense",
      },

      // INCOME
      {
        name: "Gaji 💰",
        icon: "💰",
        color: "#22c55e",
        type: "income",
      },
      {
        name: "Bonus 🎁",
        icon: "🎁",
        color: "#f59e0b",
        type: "income",
      },
      {
        name: "Investasi 📈",
        icon: "📈",
        color: "#14b8a6",
        type: "income",
      },
      {
        name: "Freelance 💻",
        icon: "💻",
        color: "#0ea5e9",
        type: "income",
      },
      {
        name: "Lainnya 💵",
        icon: "💵",
        color: "#6b7280",
        type: "income",
      },
    ];

    // TRANSACTION
    const result = await db.$transaction(async (tx) => {
      // CREATE USER
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // CREATE WALLET
      const wallet = await tx.wallet.create({
        data: {
          balance: 0,
          userId: user.id,
        },
      });

      // CREATE DEFAULT CATEGORIES
      await tx.category.createMany({
        data: defaultCategories.map((category) => ({
          ...category,
          isDefault: true,
          userId: user.id,
        })),
        skipDuplicates: true,
      });

      return {
        user,
        wallet,
      };
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat registrasi",
      },
      { status: 500 },
    );
  }
}
