import {
  Card,
  Box,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;

  diff?: React.ReactNode;   // 👈 ACÁ
  diffColor?: "primary" | "warning" | "success" | "error";

  progress?: number;
  highlight?: "primary" | "warning";
};


export default function StatCard({
  title,
  value,
  icon,
  diff,
  diffColor = "primary",
  progress,
  highlight,
}: StatCardProps) {
  const isHighlighted = Boolean(highlight);

  return (
    <Card
      elevation={0}
      
      
      sx={{
        margin:"0 auto",
        borderRadius: 3,
        p: 3,
        border: isHighlighted ? "none" : "1px solid",
        borderColor: "divider",
        bgcolor: isHighlighted ? "white" : "background.paper",
        color: isHighlighted ? "rgb(0, 174, 195)" : "text.primary",
        // Sombra fija para evitar pasar funciones a componentes cliente
        boxShadow: isHighlighted
          ? "0px 8px 24px rgba(0, 174, 195, 0.3)"
          : "0 1px 2px rgba(0,0,0,0.05)",
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              opacity: isHighlighted ? 0.9 : 1,
            }}
          >
            {title}
          </Typography>

          <Box sx={{ opacity: isHighlighted ? 0.8 : 1 }}>
            {icon}
          </Box>
        </Box>

        {/* Value + diff */}
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, letterSpacing: "-0.5px" }}
          >
            {value}
          </Typography>

          {diff && (
            isHighlighted ? (
              <Chip
                label={diff}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "inherit",
                  fontWeight: 500,
                }}
              />
            ) : (
              <Box
                sx={{
                  color: `${diffColor}.main`,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {diff}
              </Box>
            )
          )}
        </Box>

        {/* Progress (opcional) */}
        {progress !== undefined && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: isHighlighted
                ? "rgba(255,255,255,0.2)"
                : "grey.200",
              "& .MuiLinearProgress-bar": {
                bgcolor: isHighlighted
                  ? "rgba(255,255,255,0.7)"
                  : `${highlight ?? diffColor}.main`,
                borderRadius: 3,
              },
            }}
          />
        )}
      </Box>
    </Card>
  );
}
