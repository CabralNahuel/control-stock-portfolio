"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { actualizarArticulo, eliminarArticuloLogico } from "@/app/services/articulos";
import { useRouter } from "next/navigation";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

type Props = {
  articuloId: number;
  stockActual: number;
  stockBajoActual: number | null;
};

export function EditarArticuloForm({ articuloId, stockActual, stockBajoActual }: Props) {
  const router = useRouter();
  const [stock, setStock] = useState(String(stockActual));
  const [stockBajo, setStockBajo] = useState(stockBajoActual != null ? String(stockBajoActual) : "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogExito, setDialogExito] = useState(true);
  const [dialogMessage, setDialogMessage] = useState("");
  const [eliminarDialogOpen, setEliminarDialogOpen] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  function cerrarDialogYRedirigir() {
    setDialogOpen(false);
    if (dialogExito) router.push("/compras/stock");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    const stockNum = parseInt(stock, 10);
    const stockBajoNum = stockBajo.trim() === "" ? null : parseInt(stockBajo, 10);
    if (Number.isNaN(stockNum) || stockNum < 0) {
      setError("Stock debe ser un número ≥ 0");
      setGuardando(false);
      return;
    }
    try {
      await actualizarArticulo(articuloId, { stock: stockNum, stockBajo: stockBajoNum });
      setDialogExito(true);
      setDialogMessage("Cambios guardados correctamente.");
      setDialogOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      setDialogExito(false);
      setDialogMessage(msg);
      setDialogOpen(true);
      setError(msg);
    }
    setGuardando(false);
  }

  async function handleEliminar() {
    setEliminando(true);
    const res = await eliminarArticuloLogico(articuloId);
    setEliminando(false);
    setEliminarDialogOpen(false);
    if (res.ok) router.push("/compras/stock");
    else {
      setDialogExito(false);
      setDialogMessage(res.error);
      setDialogOpen(true);
    }
  }

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Stock actual"
          type="number"
          inputProps={{ min: 0 }}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          fullWidth
        />
        <TextField
          label="Stock bajo (umbral)"
          type="number"
          placeholder="Ej: 5 — alerta cuando el stock sea menor"
          inputProps={{ min: 0 }}
          value={stockBajo}
          onChange={(e) => setStockBajo(e.target.value)}
          fullWidth
        />
        {error && <Box sx={{ color: "error.main", fontSize: "body2" }}>{error}</Box>}
        <Button type="submit" variant="contained" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar"}
        </Button>
        <Button
          type="button"
          variant="outlined"
          color="error"
          startIcon={<DeleteOutlinedIcon />}
          onClick={() => setEliminarDialogOpen(true)}
        >
          Eliminar artículo
        </Button>
      </Box>

      <Dialog open={eliminarDialogOpen} onClose={() => !eliminando && setEliminarDialogOpen(false)}>
        <DialogTitle>Eliminar artículo</DialogTitle>
        <DialogContent>
          <DialogContentText>
           
           Articulo eliminado. Ya no se cuenta en el stock.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEliminarDialogOpen(false)} disabled={eliminando}>Cancelar</Button>
          <Button onClick={handleEliminar} color="error" variant="contained" disabled={eliminando}>
            {eliminando ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{dialogExito ? "Éxito" : "Error"}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogYRedirigir} variant="contained" autoFocus>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
