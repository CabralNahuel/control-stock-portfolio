import { NextResponse } from "next/server";
import crypto from "crypto";
import { stockDB } from "@/app/lib/db";
import { getCurrentUser, tieneRol } from "@/app/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !tieneRol(user, ["ADMIN"])) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const [rows] = await stockDB.query(
    `SELECT id, nombre, rol, createdAt, passwordUpdatedAt FROM Usuario WHERE deletedAt IS NULL ORDER BY nombre`
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !tieneRol(user, ["ADMIN"])) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { nombre, rol } = await req.json();
  if (!nombre || typeof nombre !== "string") {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  const rolValido = rol === "ADMIN" || rol === "JEFE_COMPRAS" || rol === "EMPLEADO";
  const rolFinal = rolValido ? rol : "EMPLEADO";

  const resetToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  try {
    const [result] = await stockDB.query(
      `INSERT INTO Usuario (nombre, password, rol, resetToken, resetTokenExpires) VALUES (?, ?, ?, ?, ?)`,
      [
        nombre,
        "", // se completará cuando el usuario cree su contraseña
        rolFinal,
        resetToken,
        expires,
      ]
    );
    const insertResult = result as { insertId: number };
    return NextResponse.json(
      {
        id: insertResult.insertId,
        nombre,
        rol: rolFinal,
        resetToken,
        resetTokenExpires: expires.toISOString(),
      },
      { status: 201 }
    );
  } catch (e: any) {
    if (e && typeof e === "object" && "code" in e && e.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Error al crear usuario", e);
    return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 });
  }
}

