"use client";

import { Box, Typography, IconButton, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface CantidadInputProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function CantidadInput({
  value,
  onIncrement,
  onDecrement,
}: CantidadInputProps) {
  return (
    <Box>
      <Typography fontWeight={500} mb={1} >
        Cantidad
      </Typography>

      <Box display="flex" gap={1}>
        <IconButton type="button" onClick={onDecrement}>
          <RemoveIcon />
        </IconButton>

        <TextField
          name="cantidad"
          type="number"
          value={value}
          fullWidth
          inputProps={{
            min: 1,
            style: { textAlign: "center", fontSize: 20 },
          }}
        />

        <IconButton type="button" onClick={onIncrement}>
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
}