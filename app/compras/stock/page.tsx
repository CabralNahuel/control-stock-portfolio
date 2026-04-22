"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Pagination,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Link from "next/link";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { StockListItem } from "./componentes/StockListItem";
import { useRouter } from "next/navigation";
import { getArticulos, getCategoriasConCantidad, eliminarArticuloLogico } from "@/app/services/articulos";
import type { Articulo } from "@/app/models/articulo";
import { withBasePath } from "@/app/lib/withBasePath";

const ITEMS_PER_PAGE = 10;

type CategoriaConCantidad = { id: number; nombre: string; cantidad: number };

type FiltroStock = "todos" | "con-stock" | "stock-bajo";
type OrdenStock = "alfa-az" | "alfa-za" | "ultimos";

export default function StockPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [categorias, setCategorias] = useState<CategoriaConCantidad[]>([]);
  const [page, setPage] = useState(1);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [filtroStock, setFiltroStock] = useState<FiltroStock>("todos");
  const [orden, setOrden] = useState<OrdenStock>("alfa-az");
  const [eliminarId, setEliminarId] = useState<number | null>(null);
  const [resultadoEliminar, setResultadoEliminar] = useState<{ exito: boolean; mensaje: string } | null>(null);
  const router = useRouter();
  const [puedeEliminar, setPuedeEliminar] = useState(false);

  async function confirmarEliminar() {
    if (eliminarId == null) return;
    const res = await eliminarArticuloLogico(eliminarId);
    setEliminarId(null);
    setResultadoEliminar({
      exito: res.ok,
      mensaje: res.ok ? "Artículo eliminado  Ya no se cuenta en el stock." : res.error,
    });
    if (res.ok) router.refresh();
  }

  useEffect(() => {
    async function cargar() {
      const [data, cats] = await Promise.all([
        getArticulos(),
        getCategoriasConCantidad(),
      ]);
      setArticulos(data);
      setCategorias(cats);
    }
    cargar();
  }, []);

  useEffect(() => {
    let cancel = false;
    async function cargarRol() {
      try {
        const res = await fetch(withBasePath("/api/me"));
        if (!res.ok) return;
        const data = await res.json();
        if (!cancel) {
          setPuedeEliminar(data.rol === "ADMIN" || data.rol === "JEFE_COMPRAS");
        }
      } catch {
        // ignorar
      }
    }
    cargarRol();
    return () => {
      cancel = true;
    };
  }, []);

  const filtradosYOrdenados = useMemo(() => {
    let list = [...articulos];

    if (filtroCategoria) {
      list = list.filter((a) => (a.categoria ?? "") === filtroCategoria);
    }

    if (filtroStock === "con-stock") {
      list = list.filter((a) => a.stock > 0);
    } else if (filtroStock === "stock-bajo") {
      list = list.filter(
        (a) => a.stockBajo != null && a.stock <= a.stockBajo
      );
    }

    if (orden === "alfa-az") {
      list.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (orden === "alfa-za") {
      list.sort((a, b) => b.nombre.localeCompare(a.nombre));
    } else if (orden === "ultimos") {
      list.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
    }

    return list;
  }, [articulos, filtroCategoria, filtroStock, orden]);

  const paginatedItems = filtradosYOrdenados.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filtradosYOrdenados.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(1);
  }, [page, totalPages]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", sm: "min(100%, 720px)", md: "min(100%, 1100px)", lg: "min(100%, 1400px)" },
        minHeight: "100dvh",
        pb: "80px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        pt: 4,
        px: { xs: 1.5, sm: 2, md: 2.5 },
        mx: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* Cards de categorías */}
      {categorias.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/compras/categorias/${cat.id}`}
              style={{ textDecoration: "none" }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0px 4px 12px rgba(0, 174, 195, 0.2)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CategoryOutlinedIcon fontSize="small" />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {cat.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cat.cantidad}{" "}
                      {cat.cantidad === 1 ? "artículo" : "artículos"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Link>
          ))}
        </Box>
      )}

      {/* Filtros */}
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Filtros y orden
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="filtro-categoria">Categoría</InputLabel>
            <Select
              labelId="filtro-categoria"
              label="Categoría"
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">Todas</MenuItem>
              {categorias.map((c) => (
                <MenuItem key={c.id} value={c.nombre}>
                  {c.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="filtro-stock">Stock</InputLabel>
            <Select
              labelId="filtro-stock"
              label="Stock"
              value={filtroStock}
              onChange={(e) => {
                setFiltroStock(e.target.value as FiltroStock);
                setPage(1);
              }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="con-stock">Con stock</MenuItem>
              <MenuItem value="stock-bajo">Stock bajo</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="orden">Ordenar por</InputLabel>
            <Select
              labelId="orden"
              label="Ordenar por"
              value={orden}
              onChange={(e) => {
                setOrden(e.target.value as OrdenStock);
                setPage(1);
              }}
            >
              <MenuItem value="alfa-az">Alfabético (A-Z)</MenuItem>
              <MenuItem value="alfa-za">Alfabético (Z-A)</MenuItem>
              <MenuItem value="ultimos">Últimos agregados</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Lista de artículos */}
      {paginatedItems.length === 0 ? (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No hay artículos con los filtros elegidos.
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
          {paginatedItems.map((item) => (
            <Box component="li" key={item.id} sx={{ width: "100%" }}>
              <StockListItem
                item={item}
                onRetirar={(id) => router.push(`/compras/retirar?articulo=${id}`)}
                onDetalle={(id) => router.push(`/compras/stock/${id}`)}
                onEliminar={(id) => setEliminarId(id)}
                puedeEliminar={puedeEliminar}
              />
            </Box>
          ))}
        </Box>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 1 }}>
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

      <Dialog open={eliminarId != null} onClose={() => setEliminarId(null)}>
        <DialogTitle>Eliminar artículo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar este artículo? 
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEliminarId(null)}>Cancelar</Button>
          <Button onClick={confirmarEliminar} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resultadoEliminar != null} onClose={() => setResultadoEliminar(null)}>
        <DialogTitle>{resultadoEliminar?.exito ? "Listo" : "Error"}</DialogTitle>
        <DialogContent>
          <DialogContentText>{resultadoEliminar?.mensaje}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultadoEliminar(null)} variant="contained">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
