import { redirect } from "next/navigation";
import LoginForm from "./loginForm/LoginForm";
import { Box } from "@mui/material";
import { getCurrentUser } from "@/app/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/compras/");
  }

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100dvh"
      >
        <LoginForm />
      </Box>
    </>
  );
}
