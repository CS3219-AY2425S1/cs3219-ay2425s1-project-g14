import "server-only";
import { cookies } from "next/headers";
import { UserData, UserDataAccessToken } from "@/api/structs";

export enum CookieNames {
  SESSION = "session",
  USER_DATA = "userdata",
}

export async function createSession(userDataAccessToken: UserDataAccessToken) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  cookies().set(
    CookieNames.SESSION.valueOf(),
    userDataAccessToken.accessToken,
    {
      httpOnly: true,
      secure: true,
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
}

export async function expireSession() {
  Object.values(CookieNames).forEach((name) => cookies().delete(name));
}
