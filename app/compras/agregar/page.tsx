import { getArticulos, getCategorias } from "@/app/services/articulos";
import NuevaCompraForm from "./NuevaCompraForm";
import { Box, Typography } from "@mui/material";

export default async function NuevaCompraPage() {
  const articulos = await getArticulos();
  const categorias = await getCategorias();

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        mt={4}
        mb={2}
      >
        <Typography
          variant="h3"
          sx={{ flexGrow: 1, textAlign: "center", color: "text.primary" }}
        >
          Nueva Compra
        </Typography>
      </Box>
      <NuevaCompraForm articulos={articulos} categorias={categorias} />
    </>
  );
}
