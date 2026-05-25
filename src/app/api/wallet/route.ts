import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

// GET /api/wallet - Get current user's wallet info
export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error("Get wallet error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

// PUT /api/wallet - Update wallet (manual balance adjustment)
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { balance } = body;

    if (balance === undefined || balance === null) {
      return NextResponse.json(
        { error: "Saldo harus diisi" },
        { status: 400 }
      );
    }

    if (typeof balance !== "number") {
      return NextResponse.json(
        { error: "Saldo harus berupa angka" },
        { status: 400 }
      );
    }

    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet tidak ditemukan" },
        { status: 404 }
      );
    }

    const updatedWallet = await db.wallet.update({
      where: { id: wallet.id },
      data: { balance },
    });

    return NextResponse.json({ wallet: updatedWallet });
  } catch (error) {
    console.error("Update wallet error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
