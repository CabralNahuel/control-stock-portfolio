import "server-only";

import { cookies, headers } from "next/headers";
import { stockDB } from "@/app/lib/db";
import { verifyToken } from "@/app/lib/auth-token";

export type UsuarioConRol = {
  id: number;
  nombre: string;
  rol: string;
};

export async function getCurrentUser(): Promise<UsuarioConRol | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth");
  if (auth?.value) {
    const usuarioId = Number(auth.value);
    if (Number.isFinite(usuarioId) && usuarioId >= 1) {
      const user = await getUserById(usuarioId);
      if (user) return user;
    }
  }

  const h = await headers();
  const authorization = h.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice(7).trim();
    const payload = await verifyToken(token);
    if (payload) {
      const user = await getUserById(payload.id);
      if (user) return user;
    }
  }

  return null;
}

async function getUserById(usuarioId: number): Promise<UsuarioConRol | null> {
  const [rows] = await stockDB.query(
    `SELECT id, nombre, rol FROM Usuario WHERE id = ? AND deletedAt IS NULL`,
    [usuarioId]
  );
  const result = rows as { id: number; nombre: string; rol: string }[];
  return result[0] ?? null;
}

export function tieneRol(user: UsuarioConRol | null, rolesPermitidos: string[]): boolean {
  if (!user) return false;
  return rolesPermitidos.includes(user.rol);
}

