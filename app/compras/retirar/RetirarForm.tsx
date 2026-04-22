"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Autocomplete,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import type { Articulo } from "@/app/models/articulo";
import { registrarRetiro } from "@/app/services/articulos";

type Props = {
  articulos: Articulo[];
  articuloIdPreseleccionado?: number;
};

export default function RetirarForm({ articulos, articuloIdPreseleccionado }: Props) {
  const router = useRouter();
  const preselected = articulos.find((a) => a.id === articuloIdPreseleccionado) ?? null;
  const articuloFijo = preselected != null;
  const [articulo, setArticulo] = useState<Articulo | null>(preselected);
  const [cantidad, setCantidad] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogExito, setDialogExito] = useState(true);
  const [dialogMessage, setDialogMessage] = useState("");

  const maxCantidad = articulo ? Math.max(0, articulo.stock) : 0;

  function cerrarDialogYRedirigir() {
    setDialogOpen(false);
    if (dialogExito) router.push("/compras");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!articulo) {
      setError("Seleccioná un artículo");
      return;
    }
    if (cantidad < 1 || cantidad > maxCantidad) {
      setError("Cantidad inválida");
      return;
    }
    setEnviando(true);
    const res = await registrarRetiro(articulo.id, cantidad);
    setEnviando(false);
    if (res.ok) {
      setArticulo(null);
      setCantidad(1);
      setDialogExito(true);
      setDialogMessage("Retiro registrado correctamente.");
      setDialogOpen(true);
    } else {
      setDialogExito(false);
      setDialogMessage(res.error);
      setDialogOpen(true);
      setError(res.error);
    }
  }

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <Autocomplete
          value={articulo}
          onChange={(_, value) => {
            if (articuloFijo) return;
            setArticulo(value);
          }}
          options={articulos}
          disabled={articuloFijo}
          disableClearable={articuloFijo}
          getOptionLabel={(opt) => opt.nombre}
          renderInput={(params) => (
            <TextField
              {...params}
              multiline
              rows={2}
              label="Artículo"
              placeholder={
                articuloFijo
                  ? "Artículo seleccionado desde stock"
                  : "Elegí el artículo a retirar"
              }
              required
            />
          )}
          renderOption={(props, opt) => (
            <li {...props} key={opt.id}>
              {opt.nombre} — Stock: {opt.stock}
            </li>
          )}
        />

        <TextField
          label="Cantidad"
          type="number"
          required
          value={cantidad}
          onChange={(e) =>
            setCantidad(Math.max(0, parseInt(e.target.value, 10) || 0))
          }
          inputProps={{ min: 1, max: maxCantidad }}
          helperText={articulo ? `Máximo: ${maxCantidad}` : undefined}
          fullWidth
        />

        {error && (
          <Box sx={{ color: "error.main", fontSize: "body2" }}>{error}</Box>
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={enviando}
        >
          {enviando ? "Guardando…" : "Registrar retiro"}
        </Button>
      </Box>

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
