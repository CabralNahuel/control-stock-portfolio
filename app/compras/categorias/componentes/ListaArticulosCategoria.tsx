"use client";

import { ListItem } from "@mui/material";
import { useRouter } from "next/navigation";
import { ItemCard } from "@/app/compras/stock/componentes/ItemCard";

type Articulo = {
  id: number;
  nombre: string;
  categoria: string | null;
  stock: number;
};

type Props = { articulos: Articulo[] };

export function ListaArticulosCategoria({ articulos }: Props) {
  const router = useRouter();

  return (
    <>
      {articulos.map((item) => (
        <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
          <ItemCard
            item={item}
            onRetirar={(id) => router.push(`/compras/retirar?articulo=${id}`)}
            onDetalle={(id) => router.push(`/compras/stock/${id}`)}
          />
        </ListItem>
      ))}
    </>
  );
}
