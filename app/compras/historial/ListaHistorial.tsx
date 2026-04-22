"use client";

import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Chip,
  Pagination,
} from "@mui/material";
import {
  getRetirosHistorial,
  getComprasHistorial,
  type RetiroHistorial,
  type CompraHistorial,
  type FiltrosHistorial,
} from "@/app/services/articulos";

type UsuarioStock = { id: number; nombre: string };

type Movimiento = {
  tipo: "retiro" | "compra";
  fecha: Date;
  id: number;
  cantidad: number;
  articuloNombre: string;
  usuarioNombre?: string | null;
};

type Props = { usuarios: UsuarioStock[] };
const ITEMS_PER_PAGE = 10;

function formatearFecha(d: Date) {
  return new Date(d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ListaHistorial({ usuarios }: Props) {
  const [retiros, setRetiros] = useState<RetiroHistorial[]>([]);
  const [compras, setCompras] = useState<CompraHistorial[]>([]);
  const [usuarioId, setUsuarioId] = useState<number | "">("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [orden, setOrden] = useState<"reciente" | "antiguo">("reciente");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancel = false;
    const filtros: FiltrosHistorial = {
      usuarioId: usuarioId === "" ? undefined : usuarioId,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      orden,
    };
    async function cargar() {
      const soloRetiros = filtros.usuarioId != null;
      const [r, c] = await Promise.all([
        getRetirosHistorial(filtros),
        soloRetiros ? Promise.resolve([]) : getComprasHistorial(filtros),
      ]);
      if (!cancel) {
        setRetiros(r);
        setCompras(c);
      }
    }
    cargar();
    return () => { cancel = true; };
  }, [usuarioId, fechaDesde, fechaHasta, orden]);

  const movimientos: Movimiento[] = [
    ...retiros.map((x) => ({
      tipo: "retiro" as const,
      fecha: x.fecha,
      id: x.id,
      cantidad: x.cantidad,
      articuloNombre: x.articuloNombre,
      usuarioNombre: x.usuarioNombre,
    })),
    ...compras.map((x) => ({
      tipo: "compra" as const,
      fecha: x.fecha,
      id: x.id,
      cantidad: x.cantidad,
      articuloNombre: x.articuloNombre,
      usuarioNombre: x.usuarioNombre ?? undefined,
    })),
  ].sort((a, b) => (orden === "antiguo" ? a.fecha.getTime() - b.fecha.getTime() : b.fecha.getTime() - a.fecha.getTime()));

  const totalPages = Math.ceil(movimientos.length / ITEMS_PER_PAGE);
  const paginatedMovimientos = movimientos.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [usuarioId, fechaDesde, fechaHasta, orden]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(1);
  }, [page, totalPages]);

  return (
    <>
      <Box
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Filtros
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="historial-usuario">Quién retiró</InputLabel>
            <Select
              labelId="historial-usuario"
              label="Quién retiró"
              value={usuarioId === "" ? "" : String(usuarioId)}
              onChange={(e) => {
                const value = e.target.value;
                setUsuarioId(value === "" ? "" : Number(value));
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {usuarios.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Desde"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />
          <TextField
            size="small"
            label="Hasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="historial-orden">Ordenar</InputLabel>
            <Select
              labelId="historial-orden"
              label="Ordenar"
              value={orden}
              onChange={(e) => setOrden(e.target.value as "reciente" | "antiguo")}
            >
              <MenuItem value="reciente">Último agregado primero</MenuItem>
              <MenuItem value="antiguo">Más antiguo primero</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {movimientos.length === 0 ? (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No hay movimientos con los filtros elegidos.
          </Typography>
        </Box>
      ) : (
        <Box
          component="ul"
          sx={{
            m: 0,
            p: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {paginatedMovimientos.map((m) => (
            <Box
              component="li"
              key={`${m.tipo}-${m.id}`}
              sx={{
                width: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: m.tipo === "retiro" ? "error.light" : "success.light",
                bgcolor:
                  m.tipo === "retiro"
                    ? "rgba(244, 67, 54, 0.06)"
                    : "rgba(76, 175, 80, 0.06)",
                p: 2,
                boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 1.25,
                }}
              >
                <Chip
                  label={m.tipo === "retiro" ? "Retiro" : "Compra"}
                  size="small"
                  color={m.tipo === "retiro" ? "error" : "success"}
                  variant="outlined"
                  sx={{ width: "fit-content", minWidth: 88 }}
                />
                <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                  {m.articuloNombre} · {m.cantidad}{" "}
                  {m.cantidad === 1 ? "unidad" : "unidades"}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 1,
                    columnGap: 2,
                    rowGap: 0.5,
                    width: "100%",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatearFecha(m.fecha)}
                  </Typography>
                  {m.usuarioNombre && (
                    <Typography variant="caption" color="text.secondary">
                      {m.usuarioNombre}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ my: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            size="medium"
          />
        </Box>
      )}
    </>
  );
}
