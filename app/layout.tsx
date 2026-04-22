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
            "radial-gradient(ellipse 120% 80% at 50% 0%, #d8dce6 0%, #e4e8ef 42%, #e8ecf2 100%)",
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
