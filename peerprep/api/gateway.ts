import { cookies } from "next/headers";
import {
  LoginResponse,
  Question,
  StatusBody,
  UserServiceResponse,
} from "./structs";
import DOMPurify from "isomorphic-dompurify";

export function generateAuthHeaders() {
  return {
    Authorization: `Bearer ${cookies().get("session")?.value}`,
  };
}

export function generateJSONHeaders() {
  return {
    ...generateAuthHeaders(),
    "Content-type": "application/json; charset=UTF-8",
  };
}

export async function fetchQuestion(
  questionId: string,
): Promise<Question | StatusBody> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions/solve/${questionId}`,
      {
        method: "GET",
        headers: generateAuthHeaders(),
        next: { revalidate: 5 },
      },
    );
    if (!response.ok) {
      return {
        error: await response.text(),
        status: response.status,
      };
    }

    // NOTE: this may cause the following: "Can't resolve canvas"
    // https://github.com/kkomelin/isomorphic-dompurify/issues/54
    const question = (await response.json()) as Question;
    question.content = DOMPurify.sanitize(question.content);
    return question;
  } catch (err: any) {
    return { error: err.message, status: 400 };
  }
}

export async function getSessionLogin(validatedFields: {
  email: string;
  password: string;
}): Promise<LoginResponse | StatusBody> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_USER_SERVICE}/auth/login`,
      {
        method: "POST",
        body: JSON.stringify(validatedFields),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      },
    );
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE}/users`, {
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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_USER_SERVICE}/auth/verify-token`,
      {
        method: "GET",
        headers: generateAuthHeaders(),
      },
    );
    const json = await res.json();

    if (!res.ok) {
      return { error: json.message, status: res.status };
    }
    return json;
  } catch (err: any) {
    return { error: err.message, status: 400 };
  }
}
