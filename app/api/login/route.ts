import { NextResponse } from "next/server";
import { stockDB } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { createToken } from "@/app/lib/auth-token";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, usuario, returnToken } = body as {
      password: string;
      usuario: string;
      returnToken?: boolean;
    };

    // Soportar dos esquemas posibles:
    // - esquema actual: `password`
    // - esquema viejo: `passwordHash` (migración anterior)
    let rows: any[] = [];
    try {
      const [dbRows] = await stockDB.query(
        `SELECT id, nombre, rol, password FROM Usuario WHERE nombre = ? AND deletedAt IS NULL`,
        [usuario]
      );
      rows = dbRows as any[];
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      // MySQL: ER_BAD_FIELD_ERROR cuando la columna no existe.
      if (e?.code === "ER_BAD_FIELD_ERROR" || msg.includes("Unknown column")) {
        const [dbRows] = await stockDB.query(
          `SELECT id, nombre, rol, passwordHash AS password FROM Usuario WHERE nombre = ? AND deletedAt IS NULL`,
          [usuario]
        );
        rows = dbRows as any[];
      } else {
        throw e;
      }
    }

    const result = rows as { id: number; nombre: string; rol: string; password: string }[];
    const user = result[0];

    if (!user) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
    }

    const userInfo = { id: user.id, nombre: user.nombre, rol: user.rol };

    if (returnToken) {
      const token = await createToken(userInfo);
      return NextResponse.json({ ok: true, token, user: userInfo });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("auth", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (e) {
    // Evitar que el frontend quede sin info: devolvemos JSON.
    console.error("POST /api/login error:", e);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
