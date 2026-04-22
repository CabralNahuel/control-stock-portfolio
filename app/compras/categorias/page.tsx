import { Box, Card, CardContent, Typography } from "@mui/material";
import Link from "next/link";
import { getCategoriasConCantidad } from "@/app/services/articulos";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

export default async function CategoriasPage() {
  const categorias = (await getCategoriasConCantidad()).filter((c) => c.cantidad > 0);

  return (
    <Box
      sx={{
        height: "100%",
        pb: "80px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        Categorías
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {categorias.map((cat) => (
          <Link
            key={cat.id}
            href={`/compras/categorias/${cat.id}`}
            style={{ textDecoration: "none" }}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: "0px 4px 12px rgba(0, 174, 195, 0.2)",
                },
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CategoryOutlinedIcon />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {cat.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cat.cantidad} {cat.cantidad === 1 ? "artículo" : "artículos"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Box>
      {categorias.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No hay categorías cargadas.
        </Typography>
      )}
    </Box>
  );
}
