import { Box, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { getUsuariosStock } from "@/app/services/articulos";
import { ListaHistorial } from "./ListaHistorial";
import { getCurrentUser, tieneRol } from "@/app/lib/auth";

export default async function HistorialPage() {
  const user = await getCurrentUser();
  if (!user || !tieneRol(user, ["ADMIN", "JEFE_COMPRAS"])) {
    redirect("/compras/");
  }

  const usuarios = await getUsuariosStock();

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: {
          xs: "100%",
          sm: "min(100%, 720px)",
          md: "min(100%, 1100px)",
          lg: "min(100%, 1400px)",
        },
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
      <Typography
        textAlign="center"
        variant="h6"
        sx={{ fontWeight: 600, color: "text.primary" }}
      >
        Historial
      </Typography>

      <ListaHistorial usuarios={usuarios} />
    </Box>
  );
}
