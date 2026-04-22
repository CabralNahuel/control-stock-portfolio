"use client";

import { Box, ButtonBase, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

type AccionItemProps = {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
};



export  function AccionItem({ icon, label, href, onClick }: AccionItemProps) {
  const router=useRouter();
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
    <Box >
      <ButtonBase
        onClick={handleClick}
        sx={{
          width: "100%",
          p: 2,
          borderRadius: 3,
          border: "solid 1px",
          borderColor: "divider",
          bgcolor: "background.paper",

          display: "flex",
          flexDirection: "column",
          gap: 1,
          transition: "transform 0.15s ease",
          "&:active": {
            transform: "scale(0.95)",
          },
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="body2"
          sx={{ fontWeight: 500, color: "text.primary" }}
        >
          {label}
        </Typography>
      </ButtonBase>
    </Box>
  );
}
