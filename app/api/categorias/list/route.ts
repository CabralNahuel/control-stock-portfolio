import { NextResponse } from "next/server";
import { stockDB } from "@/app/lib/db";

export async function GET() {
  const [rows] = await stockDB.query(
    `SELECT DISTINCT nombre FROM Categoria ORDER BY nombre`
  );
  const items = (rows as { nombre: string }[]).map((r) => r.nombre);
  return NextResponse.json(items);
}

