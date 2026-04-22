"use client";

import { Box, Typography, IconButton, Button } from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import type { Articulo } from "@/app/models/articulo";

type Props = {
  item: Articulo;
  onRetirar: (id: number) => void;
  onDetalle: (id: number) => void;
  onEliminar: (id: number) => void;
  puedeEliminar: boolean;
};

export function StockListItem({ item, onRetirar, onDetalle, onEliminar, puedeEliminar }: Props) {
  const isStockBajo =
    item.stockBajo != null && item.stock <= item.stockBajo;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
        columnGap: 2,
        rowGap: 1,
        alignItems: "center",
        width: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: isStockBajo ? "rgba(255, 160, 100, 0.35)" : "divider",
        bgcolor: isStockBajo ? "#FFF7ED" : "background.paper",
        p: 2,
        boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body1" fontWeight={500}>
          {item.nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.categoria ?? "Sin categoría"} · Stock: {item.stock}
          {isStockBajo && (
            <Typography component="span" variant="caption" color="warning.main" sx={{ ml: 0.5 }}>
              (bajo)
            </Typography>
          )}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: { xs: "flex-start", sm: "flex-end" },
          flexWrap: "wrap",
        }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<RemoveCircleOutlineIcon />}
          onClick={() => onRetirar(item.id)}
        >
          Retirar
        </Button>
        <IconButton size="small" onClick={() => onDetalle(item.id)} aria-label="Ver detalle">
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
        {puedeEliminar && (
          <IconButton size="small" onClick={() => onEliminar(item.id)} aria-label="Eliminar" color="error">
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
