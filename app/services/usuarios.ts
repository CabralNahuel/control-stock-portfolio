"use server";

import {personalDB} from "@/app/lib/db";

export async function getUsuarios() {
  const [rows] = await personalDB.query(`
    SELECT idpersona as id, nombre, apellido
    FROM persona
    ORDER BY apellido, nombre
  `);

  return rows as {
    id: number;
    nombre: string;
    apellido: string;
  }[];
}