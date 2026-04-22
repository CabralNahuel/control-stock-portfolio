// app/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth");

  if (auth) {
    redirect("/compras");
  } else {
    redirect("/login");
  }
}