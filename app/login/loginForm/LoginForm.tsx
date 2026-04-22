"use client";
import { Box, Typography, Button, TextField } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { withBasePath } from "@/app/lib/withBasePath";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [usuario, setUsuario] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    const res = await fetch(withBasePath("/api/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, usuario }),
    });

    if (res.ok) {
      router.push("/compras");
    } else {
      setError("Contraseña incorrecta");
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        void login();
      }}
      sx={{
        p: 4,
        maxWidth: 380,
        m: "0 auto",
        background: "white",
        borderRadius: "12px",
        border: "1px solid #c6c6cd",
        boxShadow: "0 8px 20px rgba(17, 24, 39, 0.08)",
      }}
    >
      <Box position="relative" width="10rem" height="3.25rem" margin="0 auto 0.75rem">
        <Image
          alt=""
          src={withBasePath("/logo.png")}
          fill
          priority
          style={{ objectFit: "contain" }}
        />
      </Box>
      <Typography variant="h5" textAlign="center" mb={3}>
        Stock Control Demo
      </Typography>

      <TextField
        fullWidth
        type="text"
        label="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        type="password"
        label="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />

      {error && (
        <Typography color="error" textAlign="center" mb={2}>
          {error}
        </Typography>
      )}

      <Button fullWidth variant="contained" type="submit">
        {loading ? "Verificando..." : "Ingresar"}
      </Button>
    </Box>
  );
}
