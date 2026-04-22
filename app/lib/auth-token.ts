import "server-only";
import * as jose from "jose";

const ALG = "HS256";
const EXPIRY = "7d"; // 7 días para app móvil

export type TokenPayload = {
  id: number;
  nombre: string;
  rol: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be set and at least 16 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(payload: TokenPayload): Promise<string> {
  const secret = getSecret();
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setExpirationTime(EXPIRY)
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jose.jwtVerify(token, secret);
    const id = Number(payload.id);
    if (!Number.isFinite(id) || typeof payload.nombre !== "string" || typeof payload.rol !== "string") {
      return null;
    }
    return { id, nombre: payload.nombre, rol: payload.rol };
  } catch {
    return null;
  }
}
