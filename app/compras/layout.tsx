import { Box } from "@mui/material";
import { BarraDeNavegacion } from "./componentes/BarraNavegacion";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth");

  if (!auth) {
    redirect("/login");
  }

  return (
    <Box
      sx={{
        bgcolor: "transparent",
        minHeight: "90dvh",
        display: "flex",
        flexDirection: "column",

      }}
    >
      {children}
      <BarraDeNavegacion />
    </Box>
  );
}
