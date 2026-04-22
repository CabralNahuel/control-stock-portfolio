"use client";

import { Box, ButtonBase, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export type AccionPastel = "sky" | "mint" | "peach" | "lavender" | "butter" | "rose" | "slate";

/** Pastel solo para ícono (fondo del círculo) y color del texto. */
const PASTEL: Record<AccionPastel, { soft: string; ink: string }> = {
  sky: { soft: "#E8F0FE", ink: "#1a3a5c" },
  mint: { soft: "#E3F5EE", ink: "#1b4332" },
  peach: { soft: "#FFE8E0", ink: "#6b2f20" },
  lavender: { soft: "#EDE8F5", ink: "#3d2f5c" },
  butter: { soft: "#FFF6D9", ink: "#5c4a1a" },
  rose: { soft: "#FCE4EC", ink: "#5c1f3a" },
  slate: { soft: "#E8EAED", ink: "#2f3542" },
};

/** Mismo aspecto “botón claro” para todas las acciones. */
const BTN_BG = "#f6f6f8";
const BTN_BORDER = "rgba(15, 23, 42, 0.08)";
const BTN_HOVER = "#ececf0";
const BTN_ACTIVE = "#e2e3e8";
const BTN_HOVER_BORDER = "rgba(15, 23, 42, 0.12)";

type AccionItemProps = {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  pastel?: AccionPastel;
};

const BTN_MIN_HEIGHT = 124;

export function AccionItem({
  icon,
  label,
  href,
  onClick,
  pastel = "sky",
}: AccionItemProps) {
  const router = useRouter();
  const c = PASTEL[pastel];

  function handleClick() {
    if (onClick) {
      onClick();
      return;
    }
    if (href) {
      router.push(href);
    }
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignSelf: "stretch",
        minHeight: BTN_MIN_HEIGHT,
      }}
    >
      <ButtonBase
        onClick={handleClick}
        sx={{
          width: "100%",
          minHeight: BTN_MIN_HEIGHT,
          height: "100%",
          flex: 1,
          px: 1.5,
          py: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: BTN_BORDER,
          bgcolor: BTN_BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          transition:
            "background-color 0.2s ease, border-color 0.2s ease, transform 0.12s ease, box-shadow 0.2s ease",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          "&:hover": {
            bgcolor: BTN_HOVER,
            borderColor: BTN_HOVER_BORDER,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          },
          "&:active": {
            bgcolor: BTN_ACTIVE,
            borderColor: BTN_HOVER_BORDER,
            transform: "scale(0.98)",
          },
          "&.Mui-focusVisible": {
            bgcolor: BTN_HOVER,
            outline: "2px solid rgba(19, 27, 46, 0.35)",
            outlineOffset: 2,
          },
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: c.soft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: c.ink,
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: c.ink,
            textAlign: "center",
            lineHeight: 1.25,
            px: 0.5,
          }}
        >
          {label}
        </Typography>
      </ButtonBase>
    </Box>
  );
}
