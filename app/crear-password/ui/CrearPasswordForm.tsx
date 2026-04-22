"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import { withBasePath } from "@/app/lib/withBasePath";

type Props = {
  token: string | null;
};

export function CrearPasswordForm({ token }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const [effectiveToken, setEffectiveToken] = useState<string | null>(token);

  useEffect(() => {
    if (!token && typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      const fromUrl = search.get("token");
      if (fromUrl) {
        setEffectiveToken(fromUrl);
      }
    }
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (!effectiveToken) {
      setError("Falta el token. Revisá el enlace que te pasaron.");
      return;
    }

    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(withBasePath("/api/crear-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: effectiveToken, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar la contraseña.");
        return;
      }
      setOk(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Error de red. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 6,
        p: 3,
        bgcolor: "white",
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h6" textAlign="center">
        Crear contraseña
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Definí tu contraseña para poder ingresar al sistema.
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {ok && <Alert severity="success">Contraseña guardada. Redirigiendo al login…</Alert>}

      <TextField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
      />
      <TextField
        label="Repetir contraseña"
        type="password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        fullWidth
      />

      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </Box>
  );
}

