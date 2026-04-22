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
    <Box sx={{ maxWidth: "1200px", margin: "auto", py: 6}}>
      <Typography textAlign="center" variant="h6" sx={{ fontWeight: 600, mb: 2 ,color: "white"  }}>
        Historial
      </Typography>
   
      <ListaHistorial usuarios={usuarios} />
    </Box>
  );
}
