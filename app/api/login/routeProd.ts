import { NextResponse } from "next/server";
import { stockDB } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { usuario, password } = (await req.json()) as {
      usuario: string;
      password: string;
    };

    let rows: any[] = [];
    try {
      const [dbRows] = await stockDB.query(
        `SELECT id, password FROM Usuario WHERE nombre = ? AND deletedAt IS NULL`,
        [usuario]
      );
      rows = dbRows as any[];
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (e?.code === "ER_BAD_FIELD_ERROR" || msg.includes("Unknown column")) {
        const [dbRows] = await stockDB.query(
          `SELECT id, passwordHash AS password FROM Usuario WHERE nombre = ? AND deletedAt IS NULL`,
          [usuario]
        );
        rows = dbRows as any[];
      } else {
        throw e;
      }
    }

    const result = rows as { id: number; password: string }[];
    const user = result[0];

    if (!user) {
      return NextResponse.json({ message: "Usuario o contraseña incorrectos" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ message: "Usuario o contraseña incorrectos" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (error) {
    console.error("POST /api/login (routeProd) error:", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
