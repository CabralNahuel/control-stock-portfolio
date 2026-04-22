/**
 * Crea el primer usuario ADMIN si la tabla Usuario está vacía.
 * Uso (en la carpeta del proyecto, con .env configurado):
 *   node --env-file=.env scripts/create-first-admin.mjs
 * O en Node < 20:  npx dotenv -e .env -- node scripts/create-first-admin.mjs
 */
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = join(__dirname, "..", ".env");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch (_) {
    console.warn("No .env found, using process.env");
  }
}

if (!process.env.DB_HOST) loadEnv();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
});

async function main() {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as n FROM Usuario WHERE deletedAt IS NULL"
  );
  const count = rows[0]?.n ?? 0;
  if (count > 0) {
    console.log("Ya hay usuarios en la base. No se crea ninguno.");
    process.exit(0);
  }

  const nombre = process.argv[2] || "admin";
  const password = process.argv[3] || "admin123";
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO Usuario (nombre, password, rol, createdAt) VALUES (?, ?, ?, NOW())",
    [nombre, hash, "ADMIN"]
  );
  console.log(`Primer usuario creado: ${nombre} (rol ADMIN). Contraseña: la que pasaste por parámetro o "admin123".`);
  console.log("Cambiá la contraseña después del primer login.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
