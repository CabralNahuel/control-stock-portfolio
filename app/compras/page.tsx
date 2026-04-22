"use server";

import { Box } from "@mui/material";
import Link from "next/link";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StatCard from "./componentes/cards";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AccionesRapidas from "./componentes/AccionesRapidas";
import { getLowStockCount, getTotalStock } from "../services/articulos";

export default async function AdminPage() {
  const [totalStock, lowStockCount] = await Promise.all([
    getTotalStock(),
    getLowStockCount(),
  ]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        justifyContent: "space-between",
        maxWidth: 1200,
        mx: "auto",
        mt: 2,
        pb: "5rem",
        px: 2,
      }}
    >
      <Box display="flex" flexDirection={"column"} gap={2}>
        <Link href="/compras/stock" style={{ textDecoration: "none" }}>
          <Box sx={{ cursor: "pointer" }}>
            <StatCard
              title="Total de Artículos"
              value={totalStock}
              diff=""
              icon={<Inventory2OutlinedIcon />}
              highlight="primary"
            />
          </Box>
        </Link>

        <Link href="/compras/alertas" style={{ textDecoration: "none" }}>
          <Box sx={{ cursor: "pointer" }}>
            <StatCard
              title="Productos con stock bajo"
              value={lowStockCount}
              diff=""
              icon={<WarningAmberOutlinedIcon color="warning" />}
              diffColor="warning"
              progress={lowStockCount > 0 ? 100 : 0}
            />
          </Box>
        </Link>
      </Box>
      <Box>
        <AccionesRapidas />
      </Box>
    </Box>
  );
}
