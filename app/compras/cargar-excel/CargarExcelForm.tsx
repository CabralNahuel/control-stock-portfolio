"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import * as XLSX from "xlsx";
import type { FilaExcel } from "@/app/services/articulos";
import { importarArticulosDesdeExcel, getCategoriasParaNombres } from "@/app/services/articulos";
import { withBasePath } from "@/app/lib/withBasePath";

type PreviewItem = {
  nombre: string;
  cantidad: string;
  categoria: string;
  stockBajo: string;
};

export function CargarExcelForm() {
  const [cargando, setCargando] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogExito, setDialogExito] = useState(true);
  const [dialogMessage, setDialogMessage] = useState("");
  const [preview, setPreview] = useState<PreviewItem[] | null>(null);
  const [categoriasBD, setCategoriasBD] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function cargarCategorias() {
      try {
        const res = await fetch(withBasePath("/api/categorias/list"));
        if (!res.ok) return;
        const data = (await res.json()) as string[];
        setCategoriasBD(data);
      } catch {
        // ignorar errores de carga de categorías
      }
    }
    cargarCategorias();
  }, []);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const normalizarCategoria = (nombre: string) => {
    const n = nombre.trim();
    if (!n) return "";
    const lower = n.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  function leerExcel(file: File): Promise<PreviewItem[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) return reject(new Error("No se pudo leer el archivo"));
          const wb = XLSX.read(data, { type: "binary" });
          const firstSheet = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet, {
            header: 1,
          }) as unknown[][];
          if (rows.length < 2) return resolve([]);

          const header = (rows[0] as unknown[]).map((h) =>
            String(h ?? "").toLowerCase().trim()
          );
          // Para tu Excel: columna ARTÍCULO
          const idxNombre =
            header.findIndex(
              (h) =>
                h === "articulo" ||
                h === "artículo" ||
                h === "nombre" ||
                h === "artículo " // por si viene con espacios
            );

          if (idxNombre < 0) {
            return reject(
              new Error(
                "No se encontró una columna de artículo/nombre en la primera fila."
              )
            );
          }

          // Agrupar por nombre para que el stock sea la cantidad de filas con ese nombre
          const map = new Map<string, number>();
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i] as unknown[];
            const nombre = row[idxNombre] != null ? String(row[idxNombre]).trim() : "";
            if (!nombre) continue;
            const key = nombre;
            map.set(key, (map.get(key) ?? 0) + 1);
          }

          const previewItems: PreviewItem[] = Array.from(map.entries())
            .map(([nombre, cantidad]) => ({
              nombre,
              cantidad: String(cantidad),
              categoria: "",
              stockBajo: "",
            }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre));

          resolve(previewItems);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsBinaryString(file);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCargando(true);
    setDialogOpen(false);
    setPreview(null);
    try {
      const items = await leerExcel(file);
      if (items.length === 0) {
        setDialogExito(false);
        setDialogMessage("No se encontraron filas con artículos válidos.");
        setDialogOpen(true);
        setCargando(false);
        return;
      }
      const categoriasBD = await getCategoriasParaNombres(items.map((i) => i.nombre));
      const itemsConCategoria = items.map((item, i) => ({
        ...item,
        categoria: categoriasBD[i] ? normalizarCategoria(categoriasBD[i]) : item.categoria,
      }));
      setPreview(itemsConCategoria);
    } catch (err) {
      setDialogExito(false);
      setDialogMessage(err instanceof Error ? err.message : "Error al procesar el archivo");
      setDialogOpen(true);
    }
    setCargando(false);
    e.target.value = "";
  }

  async function handleConfirmarImportacion() {
    if (!preview) return;
    setCargando(true);
    try {
      const filas: FilaExcel[] = preview.map((p) => {
        const stockNum = Number(p.cantidad);
        const stockBajoNum =
          p.stockBajo.trim() === "" ? undefined : Number(p.stockBajo);
        return {
          nombre: p.nombre.trim(),
          categoria: normalizarCategoria(p.categoria || "Sin categoría"),
          stock: Number.isFinite(stockNum) && stockNum >= 0 ? stockNum : 0,
          stockBajo: Number.isFinite(stockBajoNum) && stockBajoNum! >= 0 ? stockBajoNum : undefined,
        };
      });
      const res = await importarArticulosDesdeExcel(filas);
      setDialogExito(res.ok);
      setDialogMessage(
        res.ok ? `Se importaron ${res.importados} artículo(s).` : res.error
      );
      setDialogOpen(true);
      setPreview(null);
    } catch (err) {
      setDialogExito(false);
      setDialogMessage(
        err instanceof Error ? err.message : "Error al importar los artículos"
      );
      setDialogOpen(true);
    }
    setCargando(false);
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          
        }}
      >
        <Box
          sx={{
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 3,
            p: 4,
            textAlign: "center",
            mb: 3,
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <Button
            variant="contained"
            size="large"
            startIcon={<UploadFileIcon />}
            disabled={cargando}
            onClick={() => inputRef.current?.click()}
          >
            {cargando ? "Procesando…" : "Elegir archivo Excel"}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            .xlsx o .xls — se usará solo la columna de artículo; el stock será la
            cantidad de filas con el mismo nombre.
          </Typography>
        </Box>

        {preview && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Revisá los artículos antes de importar
            </Typography>

            {/* Layout mobile: tarjetas una debajo de otra */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                flexDirection: "column",
                gap: 2,width: "100%",
              }}
            >
              {preview.map((item, idx) => (
                <Paper key={idx} sx={{ p: 2 }}>
                  <TextField
                    fullWidth
                    size="medium"
                    
                    label="Artículo"
                    sx={{ mb: 1.5}}
                    multiline={isXs}
                    rows={isXs ? 4 : 1}
                    value={item.nombre}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPreview((prev) =>
                        prev
                          ? prev.map((p, i) =>
                              i === idx ? { ...p, nombre: val } : p
                            )
                          : prev
                      );
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Stock"
                    type="number"
                    sx={{ mb: 1.5 }}
                    inputProps={{ min: 0 }}
                    value={item.cantidad}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPreview((prev) =>
                        prev
                          ? prev.map((p, i) =>
                              i === idx
                                ? { ...p, cantidad: val }
                                : p
                            )
                          : prev
                      );
                    }}
                  />
                  <Autocomplete
                    size="small"
                    freeSolo
                    options={categoriasBD.map((c) => normalizarCategoria(c))}
                    value={item.categoria}
                    onChange={(_, newValue) => {
                      const val = (newValue ?? "") as string;
                      setPreview((prev) =>
                        prev
                          ? prev.map((p, i) =>
                              i === idx ? { ...p, categoria: val } : p
                            )
                          : prev
                      );
                    }}
                    onInputChange={(_, newInput) => {
                      setPreview((prev) =>
                        prev
                          ? prev.map((p, i) =>
                              i === idx ? { ...p, categoria: newInput } : p
                            )
                          : prev
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Categoría"
                        placeholder="Ej: Informática"
                        sx={{ mb: 1.5 }}
                      />
                    )}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Stock bajo (opcional)"
                    type="number"
                    inputProps={{ min: 0 }}
                    value={item.stockBajo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPreview((prev) =>
                        prev
                          ? prev.map((p, i) =>
                              i === idx ? { ...p, stockBajo: val } : p
                            )
                          : prev
                      );
                    }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        setPreview((prev) =>
                          prev ? prev.filter((_, i) => i !== idx) : prev
                        )
                      }
                      startIcon={<DeleteOutlineIcon fontSize="small" />}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Layout desktop: tabla */}
            <TableContainer
              component={Paper}
              sx={{
                width: "100%",
                overflowX: "auto",
                display: { xs: "none", md: "block" },
                
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Artículo</TableCell>
                    <TableCell align="left">Stock</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="left">Stock bajo (opcional)</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell width="40%">
                        <TextField
                          fullWidth
                          size="small"
                          value={item.nombre}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPreview((prev) =>
                              prev
                                ? prev.map((p, i) =>
                                    i === idx ? { ...p, nombre: val } : p
                                  )
                                : prev
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" width="15%">
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 0 }}
                          value={item.cantidad}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPreview((prev) =>
                              prev
                                ? prev.map((p, i) =>
                                    i === idx
                                      ? { ...p, cantidad: val }
                                      : p
                                  )
                                : prev
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell width="25%">
                        <Autocomplete
                          size="small"
                          freeSolo
                          options={categoriasBD.map((c) => normalizarCategoria(c))}
                          value={item.categoria}
                          onChange={(_, newValue) => {
                            const val = (newValue ?? "") as string;
                            setPreview((prev) =>
                              prev
                                ? prev.map((p, i) =>
                                    i === idx ? { ...p, categoria: val } : p
                                  )
                                : prev
                            );
                          }}
                          onInputChange={(_, newInput) => {
                            setPreview((prev) =>
                              prev
                                ? prev.map((p, i) =>
                                    i === idx ? { ...p, categoria: newInput } : p
                                  )
                                : prev
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Ej: Informática"
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 0 }}
                          placeholder="Ej: 5"
                          value={item.stockBajo}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPreview((prev) =>
                              prev
                                ? prev.map((p, i) =>
                                    i === idx ? { ...p, stockBajo: val } : p
                                  )
                                : prev
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" width="5%">
                        <Button
                          size="small"
                          color="error"
                          onClick={() =>
                            setPreview((prev) =>
                              prev ? prev.filter((_, i) => i !== idx) : prev
                            )
                          }
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setPreview(null)}
                disabled={cargando}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmarImportacion}
                disabled={cargando}
              >
                Importar artículos
              </Button>
            </Box>
          </>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{dialogExito ? "Éxito" : "Error"}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="contained">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
