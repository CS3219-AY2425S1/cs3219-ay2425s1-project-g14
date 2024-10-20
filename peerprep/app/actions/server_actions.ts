"use server";
import { getSessionLogin, postSignupUser, verifyUser } from "@/api/gateway";
// defines the server-sided login action.
import {
  SignupFormSchema,
  LoginFormSchema,
  FormState,
  isError,
  UserServiceResponse,
} from "@/api/structs";
import { createSession, expireSession } from "@/app/actions/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// credit - taken from Next.JS Auth tutorial
export async function signup(state: FormState, formData: FormData) {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const json = await postSignupUser(validatedFields.data);

  if (!isError(json)) {
    // TODO: handle OK
    redirect("/auth/login");
  } else {
    // TODO: handle failure codes: 400, 409, 500.
    console.log(`${json.status}: ${json.error}`);
  }
}

export async function login(state: FormState, formData: FormData) {
  // Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const json = await getSessionLogin(validatedFields.data);
  if (!isError(json)) {
    await createSession(json.data.accessToken);
    redirect("/questions");
  } else {
    console.log(json.error);
  }
}

export async function hydrateUid(): Promise<undefined | string> {
  if (!cookies().has("session")) {
    console.log("No session found - triggering switch back to login page.");
    redirect("/auth/login");
  }
  const json = await verifyUser();
  if (isError(json)) {
    console.log("Failed to fetch user ID.");
    console.log(`Error ${json.status}: ${json.error}`);
    redirect("/api/internal/auth/expire");
  }

  return json.data.id;
}
