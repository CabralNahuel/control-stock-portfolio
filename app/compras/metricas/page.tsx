import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser, tieneRol } from "@/app/lib/auth";
import { MetricasClient } from "./ui/MetricasClient";

export default async function MetricasPage() {
  const user = await getCurrentUser();
  if (!user || !tieneRol(user, ["ADMIN", "JEFE_COMPRAS"])) {
    redirect("/compras/");
  }

  return <MetricasClient />;
}
