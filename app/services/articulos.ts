"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { stockDB } from "@/app/lib/db";
import { getCurrentUser, tieneRol } from "@/app/lib/auth";
import { normalizarNombreArticulo } from "@/app/lib/normalizarNombre";

export async function getArticulos() {
  const [rows] = await stockDB.query(`
    SELECT a.id, a.nombre, c.nombre AS categoria, a.stock, a.stockBajo, a.createdAt
    FROM Articulo a
    LEFT JOIN Categoria c ON c.id = a.categoriaId
    WHERE a.deletedAt IS NULL
    ORDER BY a.nombre
  `);

  const list = rows as {
    id: number;
    nombre: string;
    categoria: string | null;
    stock: number;
    stockBajo: number | null;
    createdAt: Date;
  }[];

  // Un solo ítem por nombre (normalizado): sumar stock, mantener el createdAt más reciente
  const porNombre = new Map<
    string,
    { id: number; nombre: string; categoria: string | null; stock: number; stockBajo: number | null; createdAt: Date }
  >();
  for (const a of list) {
    const clave = normalizarNombreArticulo(a.nombre);
    const existente = porNombre.get(clave);
    const createdAt = a.createdAt ? new Date(a.createdAt) : new Date(0);
    if (existente) {
      existente.stock += a.stock;
      if (createdAt > new Date(existente.createdAt)) existente.createdAt = createdAt;
    } else {
      porNombre.set(clave, {
        id: a.id,
        nombre: clave,
        categoria: a.categoria,
        stock: a.stock,
        stockBajo: a.stockBajo,
        createdAt,
      });
    }
  }
  return Array.from(porNombre.values())
    .filter((a) => a.stock > 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function getCategorias() {
  const [rows] = await stockDB.query(`
    SELECT id, nombre
    FROM Categoria
    ORDER BY nombre
  `);

  return rows as { id: number; nombre: string }[];
}

export async function getTotalStock() {
  const [rows] = await stockDB.query(`
    SELECT SUM(a.stock) AS totalStock
    FROM Articulo a
    WHERE a.deletedAt IS NULL
  `);

  const result = rows as { totalStock: number | null }[];

  return result[0]?.totalStock ?? 0;
}

/** Cuenta productos (agregados por nombre) cuyo stock total es ≤ umbral stockBajo */
export async function getLowStockCount() {
  const todos = await getArticulos();
  return todos.filter(
    (a) => a.stockBajo != null && a.stock <= a.stockBajo
  ).length;
}

/** Artículos con stock ≤ umbral (stockBajo), agregados por nombre */
export async function getArticulosStockBajo() {
  const todos = await getArticulos();
  return todos.filter(
    (a) => a.stockBajo != null && a.stock <= a.stockBajo
  );
}

export async function getCategoriaById(id: number) {
  const [rows] = await stockDB.query(
    `SELECT id, nombre FROM Categoria WHERE id = ?`,
    [id]
  );
  const result = rows as { id: number; nombre: string }[];
  return result[0] ?? null;
}

export async function getCategoriasConCantidad() {
  const [rows] = await stockDB.query(`
    SELECT
      c.id,
      c.nombre,
      COALESCE(COUNT(an.nombre_normalizado), 0) AS cantidad
    FROM Categoria c
    LEFT JOIN (
      SELECT
        a.categoriaId,
        LOWER(TRIM(a.nombre)) AS nombre_normalizado,
        SUM(a.stock) AS stock_total
      FROM Articulo a
      WHERE a.deletedAt IS NULL
      GROUP BY a.categoriaId, LOWER(TRIM(a.nombre))
      HAVING SUM(a.stock) > 0
    ) an ON an.categoriaId = c.id
    GROUP BY c.id, c.nombre
    HAVING COALESCE(COUNT(an.nombre_normalizado), 0) > 0
    ORDER BY c.nombre
  `);

  return rows as { id: number; nombre: string; cantidad: number }[];
}

export async function getArticulosByCategoriaId(categoriaId: number) {
  const [rows] = await stockDB.query(
    `
    SELECT a.id, a.nombre, c.nombre AS categoria, a.stock, a.stockBajo
    FROM Articulo a
    LEFT JOIN Categoria c ON c.id = a.categoriaId
    WHERE a.categoriaId = ? AND a.deletedAt IS NULL
    ORDER BY a.nombre
  `,
    [categoriaId]
  );

  const list = rows as {
    id: number;
    nombre: string;
    categoria: string | null;
    stock: number;
    stockBajo: number | null;
  }[];

  // Misma lógica: un ítem por nombre normalizado, stock sumado
  const porNombre = new Map<
    string,
    { id: number; nombre: string; categoria: string | null; stock: number; stockBajo: number | null }
  >();
  for (const a of list) {
    const clave = normalizarNombreArticulo(a.nombre);
    const existente = porNombre.get(clave);
    if (existente) {
      existente.stock += a.stock;
    } else {
      porNombre.set(clave, {
        id: a.id,
        nombre: clave,
        categoria: a.categoria,
        stock: a.stock,
        stockBajo: a.stockBajo,
      });
    }
  }
  return Array.from(porNombre.values())
    .filter((a) => a.stock > 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function getArticuloById(id: number) {
  const [rows] = await stockDB.query(
    `
    SELECT a.id, a.nombre, c.nombre AS categoria, a.stock, a.stockBajo, a.categoriaId
    FROM Articulo a
    LEFT JOIN Categoria c ON c.id = a.categoriaId
    WHERE a.id = ? AND a.deletedAt IS NULL
  `,
    [id]
  );
  const result = rows as {
    id: number;
    nombre: string;
    categoria: string | null;
    stock: number;
    stockBajo: number | null;
    categoriaId: number;
  }[];
  return result[0] ?? null;
}

/** Igual que getArticuloById pero con stock sumado de todas las filas del mismo nombre */
export async function getArticuloByIdConStockAgregado(id: number) {
  const primero = await getArticuloById(id);
  if (!primero) return null;

  const [rows] = await stockDB.query(
    `
    SELECT a.id, a.nombre, c.nombre AS categoria, a.stock, a.stockBajo, a.categoriaId
    FROM Articulo a
    LEFT JOIN Categoria c ON c.id = a.categoriaId
    WHERE LOWER(TRIM(a.nombre)) = LOWER(TRIM(?)) AND a.deletedAt IS NULL
  `,
    [primero.nombre]
  );

  const list = rows as {
    id: number;
    nombre: string;
    categoria: string | null;
    stock: number;
    stockBajo: number | null;
    categoriaId: number;
  }[];

  const stockTotal = list.reduce((acc, a) => acc + a.stock, 0);
  const nombreNorm = normalizarNombreArticulo(primero.nombre);

  return {
    id: primero.id,
    nombre: nombreNorm,
    categoria: primero.categoria,
    stock: stockTotal,
    stockBajo: primero.stockBajo,
    categoriaId: primero.categoriaId,
    /** Stock de la fila representativa (id); para editar solo esa fila */
    stockFilaRepresentativa: primero.stock,
  };
}

/** Busca por nombre ignorando mayúsculas/minúsculas (un solo artículo por nombre) */
export async function findArticuloPorNombre(nombre: string) {
  const n = nombre.trim();
  if (!n) return null;
  const [rows] = await stockDB.query(
    `SELECT a.id, a.nombre, c.nombre AS categoria, a.stock, a.stockBajo
     FROM Articulo a
     LEFT JOIN Categoria c ON c.id = a.categoriaId
     WHERE LOWER(TRIM(a.nombre)) = LOWER(?) AND a.deletedAt IS NULL`,
    [n]
  );
  const result = rows as {
    id: number;
    nombre: string;
    categoria: string | null;
    stock: number;
    stockBajo: number | null;
  }[];
  return result[0] ?? null;
}

/** Obtiene categoría por nombre (insensible a mayúsculas) o null */
export async function getCategoriaPorNombre(nombre: string) {
  const n = nombre.trim();
  if (!n) return null;
  const [rows] = await stockDB.query(
    `SELECT id, nombre FROM Categoria WHERE LOWER(TRIM(nombre)) = LOWER(?)`,
    [n]
  );
  const result = rows as { id: number; nombre: string }[];
  return result[0] ?? null;
}

/** Crea categoría si no existe; devuelve id (y nombre canónico) */
export async function crearCategoriaSiNoExiste(nombre: string): Promise<{ id: number; nombre: string }> {
  const existente = await getCategoriaPorNombre(nombre);
  if (existente) return existente;
  const nombreCanonico = nombre.trim().charAt(0).toUpperCase() + nombre.trim().slice(1).toLowerCase();
  const [result] = await stockDB.query(
    `INSERT INTO Categoria (nombre) VALUES (?)`,
    [nombreCanonico]
  );
  const insertResult = result as { insertId: number };
  return { id: insertResult.insertId, nombre: nombreCanonico };
}

/** Crea artículo si no existe (nombre normalizado); devuelve artículo con id */
export async function crearArticuloSiNoExiste(
  nombre: string,
  categoriaId: number,
  stockBajo: number | null
): Promise<{ id: number; nombre: string; categoria: string | null; stock: number; stockBajo: number | null }> {
  const nombreNorm = normalizarNombreArticulo(nombre);
  const existente = await findArticuloPorNombre(nombreNorm);
  if (existente) {
    if (stockBajo != null) {
      await stockDB.query(`UPDATE Articulo SET stockBajo = ? WHERE id = ?`, [stockBajo, existente.id]);
    }
    return { ...existente, stockBajo: stockBajo ?? existente.stockBajo };
  }
  const [insertResult] = await stockDB.query(
    `INSERT INTO Articulo (nombre, categoriaId, stock, stockBajo) VALUES (?, ?, 0, ?)`,
    [nombreNorm, categoriaId, stockBajo]
  );
  const r = insertResult as { insertId: number };
  const cat = await getCategoriaById(categoriaId);
  return {
    id: r.insertId,
    nombre: nombreNorm,
    categoria: cat?.nombre ?? null,
    stock: 0,
    stockBajo,
  };
}

export async function actualizarArticuloStockBajo(articuloId: number, stockBajo: number | null) {
  await stockDB.query(`UPDATE Articulo SET stockBajo = ? WHERE id = ?`, [stockBajo, articuloId]);
}

export async function actualizarArticulo(articuloId: number, data: { stock?: number; stockBajo?: number | null }) {
  if (data.stock !== undefined && data.stockBajo !== undefined) {
    await stockDB.query(
      `UPDATE Articulo SET stock = ?, stockBajo = ? WHERE id = ?`,
      [data.stock, data.stockBajo, articuloId]
    );
  } else if (data.stock != null) {
    await stockDB.query(`UPDATE Articulo SET stock = ? WHERE id = ?`, [data.stock, articuloId]);
  } else if (data.stockBajo !== undefined) {
    await stockDB.query(`UPDATE Articulo SET stockBajo = ? WHERE id = ?`, [data.stockBajo, articuloId]);
  }
  revalidatePath("/compras/stock");
  revalidatePath("/compras");
}

export type ResultadoEliminar = { ok: true } | { ok: false; error: string };

/** Borrado lógico: marca todas las filas del mismo nombre (producto) como eliminadas. Dejan de contar en stock. */
export async function eliminarArticuloLogico(articuloId: number): Promise<ResultadoEliminar> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Sesión expirada. Volvé a iniciar sesión." };
    }
    if (!tieneRol(user, ["ADMIN", "JEFE_COMPRAS"])) {
      return {
        ok: false,
        error: "No tenés permiso para eliminar artículos. Solo la oficina de informática y la jefatura de compras pueden hacerlo.",
      };
    }

    const art = await getArticuloById(articuloId);
    if (!art) return { ok: false, error: "Artículo no encontrado." };
    await stockDB.query(
      `UPDATE Articulo SET deletedAt = NOW() WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))`,
      [art.nombre]
    );
    revalidatePath("/compras");
    revalidatePath("/compras/stock");
    revalidatePath("/compras/categorias");
    revalidatePath("/compras/alertas");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar";
    return { ok: false, error: msg };
  }
}

/** Usuarios de la base de stock (para retiros) */
export async function getUsuariosStock() {
  const [rows] = await stockDB.query(`
    SELECT id, nombre FROM Usuario ORDER BY nombre
  `);
  return rows as { id: number; nombre: string }[];
}

export type ResultadoRetiro = { ok: true } | { ok: false; error: string };

/** Registra un retiro: inserta Retiro y resta cantidad del stock del artículo.
 *  Usa el usuario logueado desde la cookie "auth".
 */
export async function registrarRetiro(
  articuloId: number,
  cantidad: number
): Promise<ResultadoRetiro> {
  try {
    const cookieStore = await cookies();
    const auth = cookieStore.get("auth");
    if (!auth) {
      return { ok: false, error: "Sesión expirada. Volvé a iniciar sesión." };
    }
    const usuarioId = Number(auth.value);
    if (!Number.isFinite(usuarioId) || usuarioId < 1) {
      return { ok: false, error: "Sesión inválida. Cerra sesión y entrá de nuevo con un usuario de la base de stock." };
    }
    // Buscar todas las filas del mismo artículo (mismo nombre normalizado que el id elegido)
    const [rows] = await stockDB.query(
      `
      SELECT a2.id, a2.stock
      FROM Articulo a2
      WHERE LOWER(TRIM(a2.nombre)) = (
        SELECT LOWER(TRIM(a1.nombre)) FROM Articulo a1 WHERE a1.id = ? AND a1.deletedAt IS NULL
      )
      AND a2.deletedAt IS NULL
      ORDER BY a2.id
    `,
      [articuloId]
    );

    const articulos = rows as { id: number; stock: number }[];
    const stockTotal = articulos.reduce((acc, a) => acc + a.stock, 0);

    if (cantidad < 1) return { ok: false, error: "La cantidad debe ser al menos 1" };
    if (stockTotal < cantidad) return { ok: false, error: "No hay stock suficiente" };

    const conn = await stockDB.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `INSERT INTO Retiro (cantidad, usuarioId, articuloId) VALUES (?, ?, ?)`,
        [cantidad, usuarioId, articuloId]
      );
      // Descontar stock repartiendo entre todas las filas de ese artículo
      let restante = cantidad;
      for (const art of articulos) {
        if (restante <= 0) break;
        const aDescontar = Math.min(restante, art.stock);
        if (aDescontar > 0) {
          await conn.query(
            `UPDATE Articulo SET stock = stock - ? WHERE id = ?`,
            [aDescontar, art.id]
          );
          restante -= aDescontar;
        }
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    revalidatePath("/compras");
    revalidatePath("/compras/stock");
    revalidatePath("/compras/retirar");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al registrar retiro";
    return { ok: false, error: msg };
  }
}

/** Registra una compra: inserta Compra y suma cantidad al stock. Usa el usuario logueado (cookie "auth"). */
export async function registrarCompra(articuloId: number, cantidad: number) {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth");
  const usuarioId = auth ? (Number(auth.value) || null) : null;

  const conn = await stockDB.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO Compra (cantidad, articuloId, usuarioId) VALUES (?, ?, ?)`,
      [cantidad, articuloId, usuarioId]
    );
    await conn.query(`UPDATE Articulo SET stock = stock + ? WHERE id = ?`, [cantidad, articuloId]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export type ResultadoNuevaCompra = { ok: true } | { ok: false; error: string };

/** Guarda nueva compra: crea categoría/artículo si no existen, persiste stock bajo, registra compra */
export async function guardarNuevaCompra(
  nombreArticulo: string,
  nombreCategoria: string,
  cantidad: number,
  stockBajo: number | null
): Promise<ResultadoNuevaCompra> {
  try {
    const nombreArt = nombreArticulo.trim();
    const nombreCat = nombreCategoria.trim();
    if (!nombreArt || !nombreCat) return { ok: false, error: "Faltan artículo o categoría" };
    if (cantidad < 1) return { ok: false, error: "La cantidad debe ser al menos 1" };

    const { id: categoriaId } = await crearCategoriaSiNoExiste(nombreCat);
    const articulo = await crearArticuloSiNoExiste(nombreArt, categoriaId, stockBajo);
    await registrarCompra(articulo.id, cantidad);
    revalidatePath("/compras");
    revalidatePath("/compras/agregar");
    revalidatePath("/compras/stock");
    revalidatePath("/compras/categorias");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al guardar";
    return { ok: false, error: msg };
  }
}

// --- Carga desde Excel ---

/** Devuelve la categoría en BD para cada nombre (mismo orden); "" si no existe. */
export async function getCategoriasParaNombres(nombres: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const n of nombres) {
    const nombre = String(n ?? "").trim();
    if (!nombre) {
      out.push("");
      continue;
    }
    const art = await findArticuloPorNombre(nombre);
    out.push(art?.categoria ?? "");
  }
  return out;
}

export type FilaExcel = {
  nombre: string;
  categoria: string;
  stock?: number;
  stockBajo?: number;
};

export type ResultadoImportacion = { ok: true; importados: number } | { ok: false; error: string };

export async function importarArticulosDesdeExcel(filas: FilaExcel[]): Promise<ResultadoImportacion> {
  if (!filas.length) return { ok: false, error: "El archivo no tiene filas de datos." };
  let importados = 0;
  try {
    for (const row of filas) {
      const nombre = String(row.nombre ?? "").trim();
      if (!nombre) continue;
      const stock = Number(row.stock);
      const stockNum = Number.isFinite(stock) && stock >= 0 ? stock : 0;
      const stockBajo = row.stockBajo != null ? (Number(row.stockBajo) || null) : null;

      const existente = await findArticuloPorNombre(nombre);
      if (existente) {
        // Ya existe: usar su categoría, sumar stock y registrar la compra en historial
        if (stockBajo != null) {
          await actualizarArticuloStockBajo(existente.id, stockBajo);
        }
        if (stockNum > 0) {
          await registrarCompra(existente.id, stockNum);
        }
        importados++;
      } else {
        // Nuevo: crear categoría y artículo, registrar compra en historial
        const categoria = String(row.categoria ?? "").trim();
        if (!categoria) continue;
        const { id: categoriaId } = await crearCategoriaSiNoExiste(categoria);
        const articulo = await crearArticuloSiNoExiste(nombre, categoriaId, stockBajo);
        if (stockNum > 0) {
          await registrarCompra(articulo.id, stockNum);
        }
        importados++;
      }
    }
    revalidatePath("/compras");
    revalidatePath("/compras/stock");
    revalidatePath("/compras/categorias");
    revalidatePath("/compras/alertas");
    revalidatePath("/compras/historial");
    return { ok: true, importados };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al importar";
    return { ok: false, error: msg };
  }
}

// --- Historial (retiros y compras) ---

export type RetiroHistorial = {
  id: number;
  cantidad: number;
  fecha: Date;
  articuloNombre: string;
  usuarioNombre: string;
};

export type CompraHistorial = {
  id: number;
  cantidad: number;
  fecha: Date;
  articuloNombre: string;
  usuarioNombre: string | null;
};

export type FiltrosHistorial = {
  usuarioId?: number;
  fechaDesde?: string; // YYYY-MM-DD
  fechaHasta?: string;
  orden?: "reciente" | "antiguo";
};

export async function getRetirosHistorial(filtros: FiltrosHistorial = {}): Promise<RetiroHistorial[]> {
  let sql = `
    SELECT r.id, r.cantidad, r.fecha, a.nombre AS articuloNombre, u.nombre AS usuarioNombre
    FROM Retiro r
    JOIN Articulo a ON r.articuloId = a.id
    JOIN Usuario u ON r.usuarioId = u.id
    WHERE 1=1
  `;
  const params: (number | string)[] = [];
  if (filtros.usuarioId != null) {
    sql += ` AND r.usuarioId = ?`;
    params.push(filtros.usuarioId);
  }
  if (filtros.fechaDesde) {
    sql += ` AND r.fecha >= ?`;
    params.push(filtros.fechaDesde + " 00:00:00");
  }
  if (filtros.fechaHasta) {
    sql += ` AND r.fecha <= ?`;
    params.push(filtros.fechaHasta + " 23:59:59");
  }
  sql += ` ORDER BY r.fecha ${filtros.orden === "antiguo" ? "ASC" : "DESC"}`;

  const [rows] = params.length ? await stockDB.query(sql, params) : await stockDB.query(sql);
  return (rows as RetiroHistorial[]).map((r) => ({
    ...r,
    fecha: new Date(r.fecha),
  }));
}

export async function getComprasHistorial(filtros: FiltrosHistorial = {}): Promise<CompraHistorial[]> {
  let sql = `
    SELECT c.id, c.cantidad, c.fecha, a.nombre AS articuloNombre, u.nombre AS usuarioNombre
    FROM Compra c
    JOIN Articulo a ON c.articuloId = a.id
    LEFT JOIN Usuario u ON c.usuarioId = u.id
    WHERE 1=1
  `;
  const params: (string)[] = [];
  if (filtros.fechaDesde) {
    sql += ` AND c.fecha >= ?`;
    params.push(filtros.fechaDesde + " 00:00:00");
  }
  if (filtros.fechaHasta) {
    sql += ` AND c.fecha <= ?`;
    params.push(filtros.fechaHasta + " 23:59:59");
  }
  sql += ` ORDER BY c.fecha ${filtros.orden === "antiguo" ? "ASC" : "DESC"}`;

  const [rows] = params.length ? await stockDB.query(sql, params) : await stockDB.query(sql);
  return (rows as CompraHistorial[]).map((r) => ({
    ...r,
    fecha: new Date(r.fecha),
  }));
}

export type MetricasComprasRetiros = {
  compras: { movimientos: number; unidades: number };
  retiros: { movimientos: number; unidades: number };
  porArticulo: {
    nombre: string;
    comprasUnidades: number;
    retirosUnidades: number;
    stockActual: number;
  }[];
};

/** Métricas entre fechas: totales de compras y retiros y desglose por artículo (para planificación de compras). */
export async function getMetricasComprasRetiros(
  fechaDesde: string,
  fechaHasta: string
): Promise<MetricasComprasRetiros> {
  const desde = fechaDesde + " 00:00:00";
  const hasta = fechaHasta + " 23:59:59";

  const [totalesCompras] = await stockDB.query(
    `SELECT COUNT(*) AS movimientos, COALESCE(SUM(c.cantidad), 0) AS unidades
     FROM Compra c
     INNER JOIN Articulo a ON c.articuloId = a.id AND a.deletedAt IS NULL
     WHERE c.fecha >= ? AND c.fecha <= ?`,
    [desde, hasta]
  );
  const [totalesRetiros] = await stockDB.query(
    `SELECT COUNT(*) AS movimientos, COALESCE(SUM(r.cantidad), 0) AS unidades
     FROM Retiro r
     INNER JOIN Articulo a ON r.articuloId = a.id AND a.deletedAt IS NULL
     WHERE r.fecha >= ? AND r.fecha <= ?`,
    [desde, hasta]
  );

  type FilaArt = { nombreNorm: string; nombre: string; unidades: number };
  const [comprasPorArt] = await stockDB.query(
    `SELECT LOWER(TRIM(a.nombre)) AS nombreNorm, MAX(a.nombre) AS nombre, SUM(c.cantidad) AS unidades
     FROM Compra c
     INNER JOIN Articulo a ON c.articuloId = a.id AND a.deletedAt IS NULL
     WHERE c.fecha >= ? AND c.fecha <= ?
     GROUP BY LOWER(TRIM(a.nombre))`,
    [desde, hasta]
  );
  const [retirosPorArt] = await stockDB.query(
    `SELECT LOWER(TRIM(a.nombre)) AS nombreNorm, MAX(a.nombre) AS nombre, SUM(r.cantidad) AS unidades
     FROM Retiro r
     INNER JOIN Articulo a ON r.articuloId = a.id AND a.deletedAt IS NULL
     WHERE r.fecha >= ? AND r.fecha <= ?
     GROUP BY LOWER(TRIM(a.nombre))`,
    [desde, hasta]
  );

  type FilaStock = { nombreNorm: string; nombre: string; stock: number };
  const [stockPorArt] = await stockDB.query(
    `SELECT LOWER(TRIM(a.nombre)) AS nombreNorm, MAX(a.nombre) AS nombre, SUM(a.stock) AS stock
     FROM Articulo a
     WHERE a.deletedAt IS NULL
     GROUP BY LOWER(TRIM(a.nombre))`
  );

  const mapRetiros = new Map<string, number>();
  (retirosPorArt as FilaArt[]).forEach((r) => mapRetiros.set(r.nombreNorm, r.unidades));
  const mapStock = new Map<string, number>();
  (stockPorArt as FilaStock[]).forEach((s) => mapStock.set(s.nombreNorm, s.stock));

  const nombres = new Set<string>([
    ...(comprasPorArt as FilaArt[]).map((x) => x.nombreNorm),
    ...mapRetiros.keys(),
    ...mapStock.keys(),
  ]);
  const porArticulo = Array.from(nombres).map((nombreNorm) => {
    const comp = (comprasPorArt as FilaArt[]).find((x) => x.nombreNorm === nombreNorm);
    const ret = (retirosPorArt as FilaArt[]).find((x) => x.nombreNorm === nombreNorm);
    return {
      nombre: comp?.nombre ?? ret?.nombre ?? nombreNorm,
      comprasUnidades: comp?.unidades ?? 0,
      retirosUnidades: ret?.unidades ?? 0,
      stockActual: mapStock.get(nombreNorm) ?? 0,
    };
  });
  porArticulo.sort((a, b) => a.nombre.localeCompare(b.nombre));

  const toNum = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
  const comprasRow = Array.isArray(totalesCompras) ? totalesCompras[0] : null;
  const retirosRow = Array.isArray(totalesRetiros) ? totalesRetiros[0] : null;

  return {
    compras: {
      movimientos: comprasRow ? toNum((comprasRow as { movimientos?: unknown }).movimientos) : 0,
      unidades: comprasRow ? toNum((comprasRow as { unidades?: unknown }).unidades) : 0,
    },
    retiros: {
      movimientos: retirosRow ? toNum((retirosRow as { movimientos?: unknown }).movimientos) : 0,
      unidades: retirosRow ? toNum((retirosRow as { unidades?: unknown }).unidades) : 0,
    },
    porArticulo: porArticulo.map((p) => ({
      nombre: p.nombre,
      comprasUnidades: toNum(p.comprasUnidades),
      retirosUnidades: toNum(p.retirosUnidades),
      stockActual: toNum(p.stockActual),
    })),
  };
}