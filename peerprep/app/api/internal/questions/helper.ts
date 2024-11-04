import { Question, QuestionFullBody, StatusBody } from "@/api/structs";

export async function deleteQuestion(id: number): Promise<StatusBody> {
  const res = await fetch(`/api/internal/questions`, {
    method: "DELETE",
    body: JSON.stringify({ qid: id }),
  });
  if (res.ok) {
    return { status: res.status };
  }
  const json = await res.json();
  return json as StatusBody;
}

export async function editQuestion(question: Question): Promise<StatusBody> {
  const res = await fetch(
    `/api/internal/questions`,
    {
      method: "PUT",
      body: JSON.stringify(question),
    },
  );
  if (!res.ok) {
    return { status: res.status };
  }
  const json = await res.json();
  return json as StatusBody;
}

export async function addQuestion(
  question: QuestionFullBody
): Promise<StatusBody> {

  const res = await fetch(`/api/internal/questions`, {
    method: "POST",
    body: JSON.stringify(question),
  });
  if (!res.ok) {
    return { status: res.status };
  }
  const json = await res.json();
  return json as StatusBody;
}
