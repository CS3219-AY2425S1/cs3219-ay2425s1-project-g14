import { expireSession } from "@/app/actions/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await expireSession();
  const url = request.nextUrl.clone();
  url.pathname = "/auth/login";
  return NextResponse.redirect(url);
}
