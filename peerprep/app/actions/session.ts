import "server-only";
import { cookies } from "next/headers";
import { UserData, UserDataAccessToken } from "@/api/structs";

export enum CookieNames {
  SESSION = "session",
  USER_DATA = "userdata",
}

export async function createSession(userDataAccessToken: UserDataAccessToken) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  try {
    console.log("Setting cookie...");

    cookies().set(
      CookieNames.SESSION.valueOf(),
      userDataAccessToken.accessToken,
      {
        httpOnly: true,
        // TODO: set this to true
        secure: false,
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
      },
    );

    const userData: UserData = {
      email: userDataAccessToken.email,
      username: userDataAccessToken.username,
      id: userDataAccessToken.id,
      isAdmin: userDataAccessToken.isAdmin,
      createdAt: userDataAccessToken.createdAt,
    };

    cookies().set(CookieNames.USER_DATA.valueOf(), JSON.stringify(userData), {
      httpOnly: true,
      secure: false,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });

    console.log("Cookies set successfully.");
  } catch (error) {
    console.error("Error setting cookie:", error);
  }
}
