export interface Articulo {
  id: number;
  nombre: string;
  categoria: string | null;
  stock: number;
  stockBajo?: number | null;
  createdAt?: Date;
}

