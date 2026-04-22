import { NextResponse } from "next/server";

function clearAuthCookie(response: NextResponse) {
  response.cookies.set("auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAuthCookie(response);
  return response;
}

export async function GET(req: Request) {
  const response = NextResponse.redirect(new URL("/login", req.url));
  clearAuthCookie(response);
  return response;
}

