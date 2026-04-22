"use client";

import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { StockListItem } from "@/app/compras/stock/componentes/StockListItem";
import type { Articulo } from "@/app/models/articulo";

type Props = { articulos: Articulo[] };

export function ListaAlertas({ articulos }: Props) {
  const router = useRouter();

  return (
    <>
      {articulos.map((item) => (
        <StockListItem
          key={item.id}
          item={item}
          onRetirar={(id) => router.push(`/compras/retirar?articulo=${id}`)}
          onDetalle={(id) => router.push(`/compras/stock/${id}`)}
          onEliminar={() => {}}
          puedeEliminar={false}
        />
      ))}
    </>
  );
}
