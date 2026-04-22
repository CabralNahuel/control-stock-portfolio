"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReplayIcon from "@mui/icons-material/Replay";
import DeleteIcon from "@mui/icons-material/Delete";
import { withBasePath } from "@/app/lib/withBasePath";

type Usuario = {
  id: number;
  nombre: string;
  rol: string;
  createdAt: string;
  passwordUpdatedAt: string | null;
};

const ENV_BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");

export function UsuariosClient() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<"ADMIN" | "JEFE_COMPRAS" | "EMPLEADO">("EMPLEADO");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ultimoToken, setUltimoToken] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const [deleting, setDeleting] = useState(false);

  const baseUrl = useMemo(() => {
    if (ENV_BASE_URL) return ENV_BASE_URL;
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  }, []);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(withBasePath("/api/admin/usuarios"));
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudieron cargar los usuarios");
        return;
      }
      setUsuarios(
        (data as any[]).map((u) => ({
          id: u.id,
          nombre: u.nombre,
          rol: u.rol,
          createdAt: u.createdAt,
          passwordUpdatedAt: u.passwordUpdatedAt ?? null,
        }))
      );
    } catch {
      setError("Error de red al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setUltimoToken(null);

    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    try {
      const res = await fetch(withBasePath("/api/admin/usuarios"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), rol }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo crear el usuario");
        return;
      }
      setMensaje("Usuario creado. Copiá el enlace de primer acceso.");
      setUltimoToken(data.resetToken);
      setNombre("");
      await cargar();
    } catch {
      setError("Error de red al crear usuario");
    }
  }

  async function resetearUsuario(id: number) {
    setError(null);
    setMensaje(null);
    setUltimoToken(null);
    try {
      const res = await fetch(withBasePath(`/api/admin/usuarios/${id}/reset`), {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo blanquear la contraseña");
        return;
      }
      setMensaje("Token de reseteo generado. Copiá el enlace de acceso.");
      setUltimoToken(data.resetToken);
    } catch {
      setError("Error de red al blanquear contraseña");
    }
  }

  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  const enlaceBase = `${baseUrl}${basePath}/crear-password?token=`;

  async function copiarEnlace(token: string) {
    const url = `${enlaceBase}${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  async function borrarUsuario() {
    if (!usuarioToDelete) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(
        withBasePath(`/api/admin/usuarios/${usuarioToDelete.id}/delete`),
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo borrar el usuario");
        return;
      }
      setUsuarioToDelete(null);
      await cargar();
    } catch {
      setError("Error de red al borrar usuario");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 900, margin:"auto", p: 2,bgcolor: "white", borderRadius: "15px" }}>
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        Gestión de usuarios
      </Typography>
 

      <Paper sx={{ p: 2, mb: 3 }} component="form" onSubmit={crearUsuario}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Crear usuario
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <TextField
            label="Nombre de usuario"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            size="small"
          />
          <TextField
            select
            label="Rol"
            value={rol}
            onChange={(e) =>
              setRol(e.target.value as "ADMIN" | "JEFE_COMPRAS" | "EMPLEADO")
            }
            size="small"
          >
            <MenuItem value="ADMIN">ADMIN (Informática)</MenuItem>
            <MenuItem value="JEFE_COMPRAS">JEFE_COMPRAS</MenuItem>
            <MenuItem value="EMPLEADO">EMPLEADO</MenuItem>
          </TextField>
          <Button type="submit" variant="contained">
            Crear
          </Button>
          <IconButton onClick={cargar} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {mensaje && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "#e8f5e9" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2">{mensaje}</Typography>
            {ultimoToken && (
              <>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  Enlace para pasar al usuario:{" "}
                  <strong>{`${enlaceBase}${ultimoToken}`}</strong>
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => copiarEnlace(ultimoToken)}
                >
                  {copiado ? "Copiado" : "Copiar enlace"}
                </Button>
              </>
            )}
          </Box>
        </Paper>
      )}
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "#ffebee" }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Paper>
      )}

<Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Usuarios existentes
        </Typography>

        {usuarios.length === 0 ? (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No hay usuarios cargados.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {usuarios.map((u) => (
              <Paper
                key={u.id}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body1" fontWeight={600} noWrap>
                    {u.nombre}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    Rol: {u.rol}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    Creado: {new Date(u.createdAt).toLocaleString("es-AR")}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    Contraseña actualizada:{" "}
                    {u.passwordUpdatedAt
                      ? new Date(u.passwordUpdatedAt).toLocaleString("es-AR")
                      : "nunca"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Tooltip title="Blanquear contraseña (genera enlace nuevo)">
                    <IconButton
                      size="small"
                      onClick={() => resetearUsuario(u.id)}
                    >
                      <ReplayIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Borrar usuario (borrado lógico)">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setUsuarioToDelete(u)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      <Dialog open={!!usuarioToDelete} onClose={() => !deleting && setUsuarioToDelete(null)}>
        <DialogTitle>Borrar usuario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de borrar al usuario <strong>{usuarioToDelete?.nombre}</strong>?
            No podrá volver a iniciar sesión. El borrado es lógico (los datos se conservan).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsuarioToDelete(null)} disabled={deleting}>
            Cancelar
          </Button>
          <Button color="error" onClick={borrarUsuario} disabled={deleting}>
            {deleting ? "Borrando…" : "Borrar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

