import { NextResponse } from "next/server";
import { stockDB } from "@/app/lib/db";
import { getCurrentUser, tieneRol } from "@/app/lib/auth";

type Params = { params: Promise<{ id: string }> };

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

  if (usuarioId === user.id) {
    return NextResponse.json(
      { error: "No podés borrarte a vos mismo" },
      { status: 400 }
    );
  }

  try {
    const [result] = await stockDB.query(
      `UPDATE Usuario SET deletedAt = NOW() WHERE id = ? AND deletedAt IS NULL`,
      [usuarioId]
    );
    const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
    if (affected === 0) {
      return NextResponse.json({ error: "Usuario no encontrado o ya borrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo borrar el usuario" }, { status: 500 });
  }
}
