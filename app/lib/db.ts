import "server-only";
import mysql from "mysql2/promise";

const useSsl =
  process.env.DB_SSL === "true" || process.env.DB_SSL === "1";

const sslConfig = useSsl
  ? {
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
    }
  : {};

/** Misma fuente que Prisma (`DATABASE_URL`) para no desfasar DB en deploy. */
function poolOptionsFromEnv(): mysql.PoolOptions {
  const rawUrl = process.env.DATABASE_URL?.trim();
  if (rawUrl) {
    const u = new URL(rawUrl);
    const dbFromUrl = decodeURIComponent(
      u.pathname.replace(/^\//, "").split("?")[0] || ""
    );
    return {
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      ...sslConfig,
      database: dbFromUrl,
    };
  }
  return {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    ...sslConfig,
  };
}

const basePool = poolOptionsFromEnv();
const dbFromUrl = basePool.database;

export const stockDB = mysql.createPool({
  ...basePool,
  database: dbFromUrl ?? process.env.DB_NAME,
});

export const personalDB = mysql.createPool({
  ...basePool,
  database: process.env.DB_PERSONAL_NAME ?? dbFromUrl ?? process.env.DB_NAME,
});
