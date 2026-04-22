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

  diff?: React.ReactNode;
  diffColor?: "primary" | "warning" | "success" | "error";

  progress?: number;
  highlight?: "primary" | "warning";
};

/** Altura mínima común para que “Total” y “Stock bajo” ocupen lo mismo. */
const STAT_CARD_MIN_HEIGHT = 172;

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

  const iconColor = isHighlighted
    ? "primary.main"
    : diffColor === "warning"
      ? "warning.main"
      : "text.secondary";

  return (
    <Card
      elevation={0}
      sx={{
        margin: "0 auto",
        borderRadius: 3,
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        color: "text.primary",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        width: "100%",
        minHeight: STAT_CARD_MIN_HEIGHT,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flex: 1,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>

          <Box sx={{ color: iconColor, display: "flex", alignItems: "center" }}>
            {icon}
          </Box>
        </Box>

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

          {diff &&
            (isHighlighted ? (
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
            ))}
        </Box>

        <Box
          sx={{
            mt: "auto",
            pt: 0.5,
            minHeight: 6,
            display: "flex",
            alignItems: "center",
          }}
        >
          {progress !== undefined ? (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                width: "100%",
                height: 6,
                borderRadius: 3,
                bgcolor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  bgcolor: `${highlight ?? diffColor}.main`,
                  borderRadius: 3,
                },
              }}
            />
          ) : (
            <Box sx={{ width: "100%", height: 6 }} aria-hidden />
          )}
        </Box>
      </Box>
    </Card>
  );
}
