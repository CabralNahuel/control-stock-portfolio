import { NextResponse } from "next/server";
import crypto from "crypto";
import { stockDB } from "@/app/lib/db";
import { getCurrentUser, tieneRol } from "@/app/lib/auth";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user || !tieneRol(user, ["ADMIN"])) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const usuarioId = Number(id);
  if (!Number.isFinite(usuarioId) || usuarioId < 1) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const resetToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  try {
    const [result] = await stockDB.query(
      `UPDATE Usuario SET resetToken = ?, resetTokenExpires = ? WHERE id = ? AND deletedAt IS NULL`,
      [resetToken, expires, usuarioId]
    );
    const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
    if (affected === 0) {
      return NextResponse.json({ error: "Usuario no encontrado o borrado" }, { status: 404 });
    }
    return NextResponse.json({
      id: usuarioId,
      resetToken,
      resetTokenExpires: expires.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "No se pudo generar el token" }, { status: 500 });
  }
}

