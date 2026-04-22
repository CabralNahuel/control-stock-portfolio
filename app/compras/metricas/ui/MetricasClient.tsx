"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { getMetricasComprasRetiros, type MetricasComprasRetiros } from "@/app/services/articulos";
import { withBasePath } from "@/app/lib/withBasePath";

const formatDateInput = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function MetricasClient() {
  const hoy = new Date();
  const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
  const [desde, setDesde] = useState(formatDateInput(inicioAnio));
  const [hasta, setHasta] = useState(formatDateInput(hoy));
  const [metricas, setMetricas] = useState<MetricasComprasRetiros | null>(null);
  const [cargando, setCargando] = useState(false);

  async function cargarMetricas() {
    setCargando(true);
    try {
      const data = await getMetricasComprasRetiros(desde, hasta);
      setMetricas(data);
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <Box
        id="metricas-print-root"
        sx={{
          p: 2,
          
          maxWidth: 1200,
          mx: "auto",
          my:"5rem",
          bgcolor: "white",
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          height: "90%",
          overflow: "auto",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Métricas para compras
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ver entre fechas cuántos artículos se compraron y cuántos se retiraron, para planificar compras anuales.
        </Typography>

        <Paper sx={{ p: 2, mb: 2 }} className="no-print">
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
            <TextField
              label="Desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <Button variant="contained" onClick={cargarMetricas} disabled={cargando}>
              {cargando ? "Cargando…" : "Ver métricas"}
            </Button>
          </Box>
        </Paper>

        {metricas && (
          <>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <Paper sx={{ p: 2, minWidth: 160 }}>
                <Typography variant="overline" color="text.secondary">
                  Compras
                </Typography>
                <Typography variant="h5">{metricas.compras.unidades}</Typography>
                <Typography variant="caption">
                  unidades en {metricas.compras.movimientos} movimiento(s)
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, minWidth: 160 }}>
                <Typography variant="overline" color="text.secondary">
                  Retiros
                </Typography>
                <Typography variant="h5">{metricas.retiros.unidades}</Typography>
                <Typography variant="caption">
                  unidades en {metricas.retiros.movimientos} movimiento(s)
                </Typography>
              </Paper>
            </Box>

            <Box
              className="no-print"
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                mb: 2,
                justifyContent: "flex-start",
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                href={withBasePath(
                  `/compras/metricas/export-excel?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`
                )}
              >
                Exportar a Excel
              </Button>
            </Box>

            {metricas.porArticulo.length > 0 ? (
              <TableContainer component={Paper} sx={{mb: 5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Artículo</TableCell>
                      <TableCell align="right">Compras (u)</TableCell>
                      <TableCell align="right">Retiros (u)</TableCell>
                      <TableCell align="right">Stock actual</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metricas.porArticulo.map((row) => (
                      <TableRow key={row.nombre}>
                        <TableCell>{row.nombre}</TableCell>
                        <TableCell align="right">{row.comprasUnidades}</TableCell>
                        <TableCell align="right">{row.retirosUnidades}</TableCell>
                        <TableCell align="right">{row.stockActual}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay movimientos en el período elegido.
              </Typography>
            )}
          </>
        )}
      </Box>
    </>
  );
}

