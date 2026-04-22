import { Box, Typography, Paper } from "@mui/material";
import { getArticulosStockBajo } from "@/app/services/articulos";
import { ListaAlertas } from "./ListaAlertas";

export default async function AlertasPage() {
  const articulos = await getArticulosStockBajo();

  return (
    <Box sx={{ p: 2, pb: "80px" ,bgcolor: "white", borderRadius: 2, border: "1px solid #e0e0e0", boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)", margin: "auto"}}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Alertas — Stock bajo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Artículos con stock por debajo del umbral configurado.
      </Typography>
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        {articulos.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No hay artículos con stock bajo.
            </Typography>
          </Box>
        ) : (
          <ListaAlertas articulos={articulos} />
        )}
      </Paper>
    </Box>
  );
}
