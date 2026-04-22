"use client";

import { Inter } from "next/font/google";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Providers } from "./Providers";
import { theme } from "./theme";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          background:
            "radial-gradient(circle at top, rgba(19, 27, 46, 0.06) 0%, rgba(252, 248, 250, 1) 50%)",
        }}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
