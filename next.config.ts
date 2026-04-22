import type { NextConfig } from "next";

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const normalizedBasePath =
  rawBasePath && rawBasePath !== "/"
    ? rawBasePath.startsWith("/")
      ? rawBasePath.replace(/\/$/, "")
      : `/${rawBasePath.replace(/\/$/, "")}`
    : undefined;

const nextConfig: NextConfig = {
  // En Render usamos raíz por defecto; si hace falta subruta, definir NEXT_PUBLIC_BASE_PATH.
  ...(normalizedBasePath ? { basePath: normalizedBasePath } : {}),
};

export default nextConfig;
