"use client";

import {
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Box,
  Button,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Articulo } from "@/app/models/articulo";

type Props = {
  item: Articulo;
  onRetirar: (id: number) => void;
  onDetalle: (id: number) => void;
};

export function ItemCard({ item, onRetirar, onDetalle }: Props) {
  return (
    <Card sx={{ width: "100%" }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Stack>
            <Typography variant="subtitle1">{item.nombre}</Typography>
            <Typography variant="body2" color="text.secondary">
              Stock: {item.stock}
            </Typography>
          </Stack>
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RemoveCircleOutlineIcon />}
              onClick={() => onRetirar(item.id)}
            >
              Retirar
            </Button>
            <IconButton size="small" onClick={() => onDetalle(item.id)} aria-label="Ver detalle">
              <VisibilityOutlinedIcon />
            </IconButton>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
