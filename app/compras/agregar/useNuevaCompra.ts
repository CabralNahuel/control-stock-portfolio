"use client";

import { useState } from "react";

export function useNuevaCompra() {
  // cantidad SIEMPRE definida → input controlado
  const [cantidad, setCantidad] = useState<number>(1);

  const incrementar = () => {
    setCantidad((prev) => prev + 1);
  };

  const decrementar = () => {
    setCantidad((prev) => Math.max(1, prev - 1));
  };

  return {
    cantidad,
    incrementar,
    decrementar,
  };
}