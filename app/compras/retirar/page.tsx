import { Box, Typography } from "@mui/material";
import { getArticulos } from "@/app/services/articulos";
import RetirarForm from "./RetirarForm";

type Props = {
  searchParams: Promise<{ articulo?: string }>;
};

export default async function RetirarPage({ searchParams }: Props) {
  const articulos = await getArticulos();
  const { articulo: articuloIdQuery } = await searchParams;
  const articuloIdPreseleccionado =
    articuloIdQuery != null && articuloIdQuery !== ""
      ? parseInt(articuloIdQuery, 10)
      : undefined;

  return (
    <Box sx={{ p: 2,width: "100%", maxWidth: 420, margin: "auto", pb: "80px",  bgcolor: "white", borderRadius: 2, border: "1px solid #e0e0e0", boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)" }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Retirar artículos
      </Typography>
      <RetirarForm
        articulos={articulos}
        articuloIdPreseleccionado={
          Number.isFinite(articuloIdPreseleccionado) ? articuloIdPreseleccionado : undefined
        }
      />
    </Box>
  );
}
