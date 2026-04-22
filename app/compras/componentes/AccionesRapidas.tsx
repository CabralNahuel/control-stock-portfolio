"use client";

import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useRouter } from "next/navigation";

import { AccionItem } from "./BotonesDeAcciones";
import { withBasePath } from "@/app/lib/withBasePath";

export default function AccionesRapidas() {
  const router = useRouter();
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
        // ignorar
      }
    }
    cargar();
    return () => {
      cancel = true;
    };
  }, []);

  const puedeVerHistorialYMetricas = rol === "ADMIN" || rol === "JEFE_COMPRAS";
  const esAdmin = rol === "ADMIN";

  async function cerrarSesion() {
    try {
      await fetch(withBasePath("/api/logout"), { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            md: "repeat(2, 1fr)",
          },
          gap: 2,
          mx: "auto",
          alignItems: "stretch",
        }}
      >
        <AccionItem
          pastel="sky"
          icon={<ListAltOutlinedIcon />}
          label="Stock"
          href="/compras/stock"
        />
        <AccionItem
          pastel="mint"
          icon={<AddBoxOutlinedIcon />}
          label="Agregar"
          href="/compras/agregar"
        />
        <AccionItem
          pastel="peach"
          icon={<RemoveCircleOutlineIcon />}
          label="Retirar"
          href="/compras/retirar"
        />
        {puedeVerHistorialYMetricas && (
          <AccionItem
            pastel="lavender"
            icon={<HistoryOutlinedIcon />}
            label="Historial"
            href="/compras/historial"
          />
        )}
        {puedeVerHistorialYMetricas && (
          <AccionItem
            pastel="butter"
            icon={<BarChartOutlinedIcon />}
            label="Métricas"
            href="/compras/metricas"
          />
        )}
        {esAdmin && (
          <AccionItem
            pastel="rose"
            icon={<PeopleAltOutlinedIcon />}
            label="Usuarios"
            href="/compras/usuarios"
          />
        )}
        <AccionItem
          pastel="slate"
          icon={<LogoutOutlinedIcon />}
          label="Cerrar sesión"
          onClick={cerrarSesion}
        />
      </Box>
    </Box>
  );
}
