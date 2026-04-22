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
        display: "flex",
        alignItems: "stretch",
        py: 1.5,
        px: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { lg: "1fr auto", sm: "1fr auto" },
          columnGap: 2,
          rowGap: 0.75,
          alignItems: "center",
          width: "100%",
          borderRadius: { xs: 2, sm: 0 },
          border: { xs: "1px solid", sm: "none" },
          borderColor: isStockBajo ? "warning.light" : "divider",
          bgcolor: {
            xs: isStockBajo ? "rgba(255, 152, 0, 0.04)" : "background.paper",
            sm: "transparent",
          },
          p: { xs: 1.25, sm: 0 },
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
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
    </Box>
  );
}
