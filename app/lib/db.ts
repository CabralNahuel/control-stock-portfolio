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

export const stockDB =  mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ...sslConfig,
});

export const personalDB =  mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_PERSONAL_NAME,
  port: Number(process.env.DB_PORT),
  ...sslConfig,
});
