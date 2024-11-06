"use server";

import { Question, QuestionFullBody, StatusBody } from "@/api/structs";
import { revalidatePath } from "next/cache";
import { generateAuthHeaders, generateJSONHeaders } from "@/api/gateway";

export async function deleteQuestion(id: number): Promise<StatusBody> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions/delete/${id}`,
    {
      method: "DELETE",
      headers: generateAuthHeaders(),
    },
  );
  if (res.ok) {
    return { status: res.status };
  }
  revalidatePath("/questions");
  const json = await res.json();
  return json as StatusBody;
}

export async function editQuestion(question: Question): Promise<StatusBody> {
  console.log("editing question", question.id);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions/replace/${question.id}`,
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
  console.log("Adding question", question.title);
  const url = `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions`;
  console.log(url);
  const res = await fetch(url, {
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
