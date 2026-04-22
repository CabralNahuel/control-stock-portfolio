import { redirect } from "next/navigation";
import { getCurrentUser, tieneRol } from "@/app/lib/auth";
import { UsuariosClient } from "./ui/UsuariosClient";

export default async function UsuariosPage() {
  const user = await getCurrentUser();
  if (!user || !tieneRol(user, ["ADMIN"])) {
    redirect("/compras/");
  }

  return <UsuariosClient />;
}

