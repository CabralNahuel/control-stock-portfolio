import { notFound } from "next/navigation";
import { getArticuloByIdConStockAgregado } from "@/app/services/articulos";
import { Box, Typography } from "@mui/material";
import { EditarArticuloForm } from "./EditarArticuloForm";

type Props = { params: Promise<{ id: string }> };

export default async function StockDetallePage({ params }: Props) {
  const { id } = await params;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) notFound();

  const articulo = await getArticuloByIdConStockAgregado(idNum);
  if (!articulo) notFound();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" ,bgcolor: "white",borderRadius: 2,border: "1px solid #e0e0e0",boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",padding: 2,height: "400px",maxWidth: 400,margin: "auto"}}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {articulo.nombre}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Categoría: {articulo.categoria ?? "—"} · Stock total: {articulo.stock}
      </Typography>
      <EditarArticuloForm
        articuloId={articulo.id}
        stockActual={articulo.stockFilaRepresentativa ?? articulo.stock}
        stockBajoActual={articulo.stockBajo}
      />
    </Box>
  );
}
