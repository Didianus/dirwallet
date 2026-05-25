import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password harus diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with wallet and default categories in a transaction
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        wallet: {
          create: {
            balance: 0,
          },
        },
        categories: {
          create: [
            // Expense categories
            { name: "Makanan 🍔", icon: "🍔", color: "#f97316", type: "expense", isDefault: true },
            { name: "Transportasi 🚗", icon: "🚗", color: "#3b82f6", type: "expense", isDefault: true },
            { name: "Belanja 🛍️", icon: "🛍️", color: "#ec4899", type: "expense", isDefault: true },
            { name: "Tagihan 📋", icon: "📋", color: "#8b5cf6", type: "expense", isDefault: true },
            { name: "Hiburan 🎬", icon: "🎬", color: "#ef4444", type: "expense", isDefault: true },
            { name: "Kesehatan 💊", icon: "💊", color: "#10b981", type: "expense", isDefault: true },
            { name: "Pendidikan 📚", icon: "📚", color: "#6366f1", type: "expense", isDefault: true },
            { name: "Lainnya 📦", icon: "📦", color: "#6b7280", type: "expense", isDefault: true },
            // Income categories
            { name: "Gaji 💰", icon: "💰", color: "#22c55e", type: "income", isDefault: true },
            { name: "Bonus 🎁", icon: "🎁", color: "#f59e0b", type: "income", isDefault: true },
            { name: "Investasi 📈", icon: "📈", color: "#14b8a6", type: "income", isDefault: true },
            { name: "Freelance 💻", icon: "💻", color: "#0ea5e9", type: "income", isDefault: true },
            { name: "Lainnya 💵", icon: "💵", color: "#6b7280", type: "income", isDefault: true },
          ],
        },
      },
      include: {
        wallet: true,
      },
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi" },
      { status: 500 }
    );
  }
}
