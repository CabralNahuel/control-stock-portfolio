/** Nombre canónico: primera letra mayúscula, resto minúscula (ej: Martillo) */
export function normalizarNombreArticulo(nombre: string): string {
  const t = nombre.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
