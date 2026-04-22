import { Box, Typography, List, ListItem } from "@mui/material";
import { notFound } from "next/navigation";
import {
  getCategoriaById,
  getArticulosByCategoriaId,
} from "@/app/services/articulos";
import { ListaArticulosCategoria } from "../componentes/ListaArticulosCategoria";

type Props = { params: Promise<{ id: string }> };

export default async function CategoriaDetallePage({ params }: Props) {
  const { id } = await params;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) notFound();

  const [categoria, articulos] = await Promise.all([
    getCategoriaById(idNum),
    getArticulosByCategoriaId(idNum),
  ]);

  if (!categoria) notFound();

  return (
    <Box
      sx={{
        height: "100%",
        pb: "80px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary", textAlign: "center" }}>
        {categoria.nombre}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {articulos.length}{" "}
        {articulos.length === 1 ? "artículo" : "artículos"} en esta categoría
      </Typography>
      <List sx={{ p: 0, display: "flex", flexDirection: "column", gap: 1 }}>
        <ListaArticulosCategoria articulos={articulos} />
      </List>
      {articulos.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No hay artículos en esta categoría.
        </Typography>
      )}
    </Box>
  );
}
