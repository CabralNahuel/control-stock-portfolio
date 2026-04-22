const normalizeBasePath = (basePath: string) => basePath.replace(/\/$/, "");

function detectBasePathFromLocation() {
  if (typeof window === "undefined") return null;
  const p = window.location.pathname;

  // Preferimos el prefijo real por la ruta actual para evitar desfasajes de env en prod.
  if (p.startsWith("/inventory-demo")) return "/inventory-demo";
  if (p.startsWith("/control-stock")) return "/control-stock";
  if (p.startsWith("/control-de-stock")) return "/control-de-stock";

  return null;
}

/**
 * Prefija rutas absolutas con el `basePath` público.
 * Úsalo en llamadas `fetch("/api/...")` para que funcionen detrás de Apache.
 */
export function withBasePath(path: string) {
  const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const basePath = normalizeBasePath(detectBasePathFromLocation() ?? envBasePath);
  if (!basePath) return path.startsWith("/") ? path : `/${path}`;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
}

