"use client";

import { Usuario } from "@/app/models/usuario";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface Props {
  usuarios: Usuario[];
  value: number | "";
  onChange: (value: number | "") => void;
}

export default function UsuarioSelect({ usuarios, value, onChange }: Props) {
  return (
    <FormControl fullWidth >
      <InputLabel id="usuario-label">Asignar a Usuario</InputLabel>

      <Select
        labelId="usuario-label"
        label="Asignar a Usuario"
        id="usuario-select"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v.toString() === "" ? "" : Number(v));
        }}
      >
        <MenuItem value="" >
          <em>Seleccione un usuario</em>
        </MenuItem>

        {usuarios.map((u) => (
          <MenuItem key={u.id} value={u.id}>
            {u.apellido}, {u.nombre}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
