import { Box, Typography } from "@mui/material";
import { CargarExcelForm } from "./CargarExcelForm";

export default function CargarExcelPage() {
  return (
    <Box
      sx={{
        p: 2,
        pb: "80px",
        
        bgcolor: "white",
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
        padding: 2,
        height: "90%",
         
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        maxHeight: "100%",
        overflow: "auto",
        margin:"auto",
        maxWidth: "1200px",
        
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Cargar artículos desde Excel
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Subí un archivo .xlsx o .xls. Se usará la columna de{" "}
        <strong>ARTÍCULO</strong> para el nombre y se agruparán las filas con el mismo nombre
        para calcular el stock de compra. Luego podés elegir la categoría y el stock bajo antes de
        importar.
      </Typography>
      <CargarExcelForm />
    </Box>
  );
}
