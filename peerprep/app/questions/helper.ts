"use server";

import { isError, Question, QuestionFullBody, StatusBody } from "@/api/structs";
import { revalidatePath } from "next/cache";
import {
  generateAuthHeaders,
  generateJSONHeaders,
  verifyUser,
} from "@/api/gateway";
import DOMPurify from "isomorphic-dompurify";

const questionServiceUrl = `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_QUESTION_SERVICE}`;

export async function deleteQuestion(id: number): Promise<StatusBody> {
  const verify = await verifyUser();
  if (isError(verify) || verify?.data.isAdmin === false) {
    return verify as StatusBody;
  }

  const res = await fetch(`${questionServiceUrl}/questions/delete/${id}`, {
    method: "DELETE",
    headers: generateAuthHeaders(),
  });
  if (res.ok) {
    return { status: res.status };
  }
  revalidatePath("/questions");
  const json = await res.json();
  return json as StatusBody;
}

export async function fetchAllQuestions(): Promise<StatusBody | Question[]> {
  console.log("Fetching all questions...");
  const res = await fetch(`${questionServiceUrl}/questions`, {
    method: "GET",
    headers: generateAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    return { status: res.status };
  }
  const json = await res.json();
  return json as Question[];
}

export async function editQuestion(question: Question): Promise<StatusBody> {
  const verify = await verifyUser();
  if (isError(verify) || verify?.data.isAdmin === false) {
    return verify as StatusBody;
  }

  console.log("editing question", question.id);
  const res = await fetch(
    `${questionServiceUrl}/questions/replace/${question.id}`,
    {
      method: "PUT",
      body: JSON.stringify(question),
      headers: generateJSONHeaders(),
    },
  );
  if (!res.ok) {
    return { status: res.status };
  }
  revalidatePath("/questions");
  revalidatePath("/questions/edit/" + question.id);
  const json = await res.json();
  return json as StatusBody;
}

export async function addQuestion(
  question: QuestionFullBody,
): Promise<StatusBody> {
  const verify = await verifyUser();
  if (isError(verify) || verify?.data.isAdmin === false) {
    return verify as StatusBody;
  }
  console.log("Adding question", question.title);
  const res = await fetch(`${questionServiceUrl}/questions`, {
    method: "POST",
    body: JSON.stringify(question),
    headers: generateJSONHeaders(),
  });
  if (!res.ok) {
    return { status: res.status };
  }
  revalidatePath("/questions");
  const json = await res.json();
  return json as StatusBody;
}

export async function fetchQuestion(
  questionId: number,
): Promise<Question | StatusBody> {
  try {
    const response = await fetch(
      `${questionServiceUrl}/questions/solve/${questionId}`,
      {
        method: "GET",
        headers: generateAuthHeaders(),
        cache: "no-store",
      },
    );
    if (!response.ok) {
      return {
        error: await response.text(),
        status: response.status,
      };
    }

    const question = (await response.json()) as Question;
    question.content = DOMPurify.sanitize(question.content);
    revalidatePath(`/questions/edit/${questionId}`);
    return question;
  } catch (err: any) {
    return { error: err.message, status: 400 };
  }
}