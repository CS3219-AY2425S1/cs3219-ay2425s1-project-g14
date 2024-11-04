import "server-only";
import { cookies } from "next/headers";

export async function createSession(accessToken: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  try {
    console.log("Setting cookie...");
    cookies().set("session", accessToken, {
      httpOnly: true,
      secure: false,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });
    console.log("Cookie set successfully.");
  } catch (error) {
    console.error("Error setting cookie:", error);
  }
}

export async function expireSession() {
  cookies().delete("session");
}
