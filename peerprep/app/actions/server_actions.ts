"use server";
import { getSessionLogin, postSignupUser, verifyUser } from "@/api/gateway";
// defines the server-sided login action.
import {
  FormState,
  isError,
  LoginFormSchema,
  SignupFormSchema,
  UserData,
  UserServiceResponse,
} from "@/api/structs";
import { createSession } from "@/app/actions/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; // credit - taken from Next.JS Auth tutorial

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
    console.log(`Error in signup: ${json.status}: ${json.error}`);
    return {
      errors: {
        username: ["Username is already in use."],
        email: ["Email is already in use."],
      },
    };
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
    await createSession(json.data);
    redirect("/questions");
  } else {
    if (json.status === 401) {
      return {
        errors: {
          email: ["Invalid email or password."],
        },
      };
    } else if (json.status === 500) {
      console.log(
        "Get session login error: " + json.error + " : " + json.status,
      );

      return {
        errors: {
          email: ["Please try again."],
        },
      };
    }
  }
}

export async function hydrateUid(): Promise<null | UserData> {
  if (!cookies().has("session")) {
    // TODO: this should not be required because of middleware
    console.log("No session found - triggering switch back to login page.");
    // redirect("/auth/login");
  }
  const json = await verifyUser();
  if (isError(json)) {
    console.log("Failed to fetch user ID.");
    console.log(`Error ${json.status}: ${json.error}`);
    redirect("/api/internal/auth/expire");
  }
  // TODO: handle error handling
  const response = json as UserServiceResponse;
  return response.data;
}
