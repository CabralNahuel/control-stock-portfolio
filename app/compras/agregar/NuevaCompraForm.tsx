"use client";
import { useNuevaCompra } from "./useNuevaCompra";

import {
  Box,
  Autocomplete,
  TextField,
  Button,
} from "@mui/material";
import { Articulo } from "@/app/models/articulo";
import { useState } from "react";
import CantidadInput from "./components/CantidadInput";

type Categoria = {
  id: number;
  nombre: string;
};

export default function NuevaCompraForm({
  articulos,
  categorias,
}: {
  articulos: Articulo[];
  categorias: Categoria[];
}) {
  const { cantidad, incrementar, decrementar } = useNuevaCompra();
  const [articuloInput, setArticuloInput] = useState("");
  const [categoriaNombre, setCategoriaNombre] = useState("");
  const [tipoBloqueado, setTipoBloqueado] = useState(false);
  const [stockBajo, setStockBajo] = useState<string>("");
  const buscarArticulo = (nombre: string) =>
    articulos.find((a) => a.nombre.toLowerCase() == nombre.toLowerCase());
  const aplicarArticulo = (nombre: string) => {
    const match = buscarArticulo(nombre);
    if (match) {
      setArticuloInput(match.nombre);
      setCategoriaNombre(match.categoria ?? "");
      setStockBajo(match.stockBajo != null ? String(match.stockBajo) : "");
      setTipoBloqueado(true);
    } else {
      setArticuloInput(nombre);
      setCategoriaNombre("");
      setTipoBloqueado(false);
      setStockBajo("");
    }
  };

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const articulo = (formData.get("articulo") as string)?.trim() || articuloInput.trim();
    const categoria = (formData.get("categoria") as string)?.trim() || categoriaNombre.trim();
    const stockBajoVal = stockBajo.trim() === "" ? null : parseInt(stockBajo, 10);
    const { guardarNuevaCompra } = await import("@/app/services/articulos");
    const res = await guardarNuevaCompra(articulo, categoria, cantidad, stockBajoVal ?? null);
    setEnviando(false);
    if (res.ok) {
      setArticuloInput("");
      setCategoriaNombre("");
      setStockBajo("");
      setTipoBloqueado(false);
      // reset cantidad is in the hook - could reset to 1
    } else {
      setError(res.error);
    }
  }

  return (
    <Box>
      {/* FORM */}
      <Box
        component="form"
        id="nueva-compra-form"
        onSubmit={handleSubmit}
        flex={1}
        px={2}
        py={3}
        display="flex"
        flexDirection="column"
        gap={2}
        maxWidth={{ xs: "100%", sm: 520 }}
        mx="auto"
        width="100%"
        bgcolor={"white"}
        borderRadius={2}
      >
        {/* Artículo */}
        <Autocomplete
          freeSolo
          options={articulos}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.nombre
          }
          inputValue={articuloInput}
          onInputChange={(_, value) => aplicarArticulo(value)}
          onChange={(_, value) => {
            if (typeof value === "string") {
              aplicarArticulo(value);
            } else if (value) {
              aplicarArticulo(value.nombre);
            } else {
              aplicarArticulo("");
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              name="articulo"
              label="Artículo"
              placeholder="Ingrese o seleccione el artículo"
              fullWidth
              required
            />
          )}
        />

        {/* Categoría + Stock bajo */}
        <Box display="flex" gap={2} flexDirection={{ xs: "column", sm: "row" }}>
          <Autocomplete
            fullWidth
            freeSolo
            options={categorias.map((c) => c.nombre)}
            value={categoriaNombre}
            onChange={(_, value) =>
              setCategoriaNombre(typeof value === "string" ? value : value ?? "")
            }
            onInputChange={(_, value) => setCategoriaNombre(value)}
            disabled={tipoBloqueado}
            renderInput={(params) => (
              <TextField
                {...params}
                name="categoria"
                label="Categoría"
                placeholder="Seleccione o escriba la categoría"
                required
              />
            )}
          />

          <TextField
            name="stockBajo"
            label="Stock bajo"
            placeholder="Ej: 5"
            type="number"
            fullWidth
            value={stockBajo}
            onChange={(e) => setStockBajo(e.target.value)}
          />
        </Box>

        {/* Cantidad */}
        <CantidadInput
          value={cantidad}
          onIncrement={incrementar}
          onDecrement={decrementar}
        />

        {error && (
          <Box sx={{ color: "error.main", fontSize: "body2" }}>{error}</Box>
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={enviando}
          sx={{ mt: 2, fontWeight: 700 }}
        >
          {enviando ? "Guardando…" : "Guardar Ingreso"}
        </Button>
      </Box>
    </Box>
  );
}
