import { cookies } from "next/headers";
import { LoginResponse, StatusBody, UserServiceResponse } from "./structs";
import { CookieNames } from "@/app/actions/session";

export function generateAuthHeaders() {
  return {
    Authorization: `Bearer ${cookies().get(CookieNames.SESSION.valueOf())?.value}`,
  };
}

export function getSessionToken() {
  return cookies().get(CookieNames.SESSION.valueOf())?.value;
}

export function getUserData() {
  return cookies().get(CookieNames.USER_DATA.valueOf())?.value;
}

export function generateJSONHeaders() {
  return {
    ...generateAuthHeaders(),
    "Content-type": "application/json; charset=UTF-8",
  };
}

export const userServiceUrl = `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_USER_SERVICE}`;

export async function getSessionLogin(validatedFields: {
  email: string;
  password: string;
}): Promise<LoginResponse | StatusBody> {
  try {
    const res = await fetch(`${userServiceUrl}/auth/login`, {
      method: "POST",
      body: JSON.stringify(validatedFields),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const json = await res.json();

    if (!res.ok) {
      // TODO: handle not OK
      return { error: json.message, status: res.status };
    }
    // TODO: handle OK
    return json;
  } catch (err: any) {
    return { error: err.message, status: 400 };
  }
}

export async function postSignupUser(validatedFields: {
  username: string;
  email: string;
  password: string;
}): Promise<UserServiceResponse | StatusBody> {
  try {
    console.log(JSON.stringify(validatedFields));
    const res = await fetch(`${userServiceUrl}/users`, {
      method: "POST",
      body: JSON.stringify(validatedFields),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const json = await res.json();

    if (!res.ok) {
      // TODO: handle not OK
      return { error: json.message, status: res.status };
    }
    // TODO: handle OK
    return json;
  } catch (err: any) {
    return { error: err.message, status: 400 };
  }
}

export async function verifyUser(): Promise<UserServiceResponse | StatusBody> {
  try {
    const res = await fetch(`${userServiceUrl}/auth/verify-token`, {
      method: "GET",
      headers: generateAuthHeaders(),
    });
    const json = (await res.json()) as UserServiceResponse;

    if (!res.ok) {
      return { error: json.message, status: res.status };
    }
    return json;
  } catch (err: any) {
    return { error: err.message, status: 400 };
  }
}
