/**
 * Crea el primer usuario ADMIN si la tabla Usuario está vacía.
 * Uso (en la carpeta del proyecto, con .env configurado):
 *   node --env-file=.env scripts/create-first-admin.mjs
 * O en Node < 20:  npx dotenv -e .env -- node scripts/create-first-admin.mjs
 */
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { execSync } from "child_process";
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

if (!process.env.DB_HOST && !process.env.DATABASE_URL) loadEnv();

const useSsl =
  process.env.DB_SSL === "true" || process.env.DB_SSL === "1";

const sslOption = useSsl
  ? {
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
    }
  : {};

/** Misma DB que Prisma (`DATABASE_URL`) para no correr el script en una base vacía. */
function poolConfig() {
  const rawUrl = process.env.DATABASE_URL?.trim();
  if (rawUrl) {
    const u = new URL(rawUrl);
    const database = decodeURIComponent(
      u.pathname.replace(/^\//, "").split("?")[0] || ""
    );
    return {
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database,
      ...sslOption,
    };
  }
  return {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    ...sslOption,
  };
}

const pool = mysql.createPool(poolConfig());

function logTargetDb() {
  const cfg = poolConfig();
  console.log(
    "[create-first-admin] Conectando a DB:",
    cfg.database || "(sin nombre en URL — revisá DATABASE_URL)",
    "| host:",
    cfg.host
  );
}

function runMigrationsFromScript() {
  console.log(
    "[create-first-admin] Falta esquema: ejecutando npx prisma migrate deploy…"
  );
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
    cwd: join(__dirname, ".."),
  });
}

async function main() {
  logTargetDb();

  let rows;
  try {
    [rows] = await pool.query(
      "SELECT COUNT(*) as n FROM Usuario WHERE deletedAt IS NULL"
    );
  } catch (e) {
    const errno = e && typeof e === "object" && "errno" in e ? e.errno : null;
    if (errno === 1146) {
      runMigrationsFromScript();
      [rows] = await pool.query(
        "SELECT COUNT(*) as n FROM Usuario WHERE deletedAt IS NULL"
      );
    } else {
      throw e;
    }
  }
  const count = rows[0]?.n ?? 0;
  if (count > 0) {
    console.log("Ya hay usuarios en la base. No se crea ninguno.");
    process.exit(0);
  }

  const nombre = process.argv[2] || process.env.FIRST_ADMIN_USER;
  const password = process.argv[3] || process.env.FIRST_ADMIN_PASSWORD;
  if (!nombre || !password) {
    console.log(
      "No se creó admin inicial: faltan FIRST_ADMIN_USER/FIRST_ADMIN_PASSWORD."
    );
    process.exit(0);
  }
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO Usuario (nombre, password, rol, createdAt) VALUES (?, ?, ?, NOW())",
    [nombre, hash, "ADMIN"]
  );
  console.log(`Primer usuario creado: ${nombre} (rol ADMIN).`);
  console.log("Cambiá la contraseña después del primer login.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
