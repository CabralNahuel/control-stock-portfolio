import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { stockDB } from "@/app/lib/db";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  const [rows] = await stockDB.query(
    `SELECT id, resetTokenExpires FROM Usuario WHERE resetToken = ?`,
    [token]
  );

  const result = rows as { id: number; resetTokenExpires: Date | string | null }[];
  const user = result[0];

  if (!user) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  if (user.resetTokenExpires) {
    const exp = new Date(user.resetTokenExpires);
    if (exp.getTime() < Date.now()) {
      return NextResponse.json({ error: "El enlace expiró, pedí uno nuevo" }, { status: 400 });
    }
  }

  const hash = await bcrypt.hash(password, 10);

  await stockDB.query(
    `UPDATE Usuario SET password = ?, resetToken = NULL, resetTokenExpires = NULL, passwordUpdatedAt = NOW() WHERE id = ?`,
    [hash, user.id]
  );

  return NextResponse.json({ ok: true });
}

