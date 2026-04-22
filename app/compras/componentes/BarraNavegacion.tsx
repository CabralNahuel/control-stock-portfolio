"use client";

import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import HistoryIcon from "@mui/icons-material/History";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { withBasePath } from "@/app/lib/withBasePath";

export function BarraDeNavegacion() {
  const router = useRouter();
  const pathname = usePathname();
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    async function cargar() {
      try {
        const res = await fetch(withBasePath("/api/me"));
        if (!res.ok) return;
        const data = await res.json();
        if (!cancel) {
          setRol(data.rol ?? null);
        }
      } catch {
        // ignorar error: dejar sin rol
      }
    }
    cargar();
    return () => {
      cancel = true;
    };
  }, []);

  const puedeVerHistorial = rol === "ADMIN" || rol === "JEFE_COMPRAS";
  const esAdmin = rol === "ADMIN";

  const value = (() => {
    if (pathname.startsWith("/compras/stock")) return 1;
    if (pathname.startsWith("/compras/historial")) return 2;
    if (pathname.startsWith("/compras/cargar-excel")) return 3;
    if (pathname.startsWith("/compras/usuarios")) return 4;
    return 0; // panel
  })();

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, newValue) => {
          if (newValue === 0) router.push("/compras");
          if (newValue === 1) router.push("/compras/stock");
          if (newValue === 2) router.push("/compras/historial");
          if (newValue === 3) router.push("/compras/cargar-excel");
          if (newValue === 4) router.push("/compras/usuarios");
        }}
      >
        <BottomNavigationAction label="Panel" icon={<DashboardIcon />} />
        <BottomNavigationAction label="Stock" icon={<ListAltOutlinedIcon />} />
        <BottomNavigationAction
          label="Historial"
          icon={<HistoryIcon />}
          sx={{ display: puedeVerHistorial ? "flex" : "none" }}
        />
        <BottomNavigationAction label="Excel" icon={<UploadFileIcon />} />
        {esAdmin && (
          <BottomNavigationAction label="Usuarios" icon={<PeopleAltOutlinedIcon />} />
        )}
      </BottomNavigation>
    </Paper>
  );
}
