import { QuestionFullBody, StatusBody } from "@/api/structs";

export async function deleteQuestion(id: number): Promise<StatusBody> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_NGINX}/api/internal/questions`,
    {
      method: "DELETE",
      body: JSON.stringify({ qid: id }),
    }
  );
  if (res.ok) {
    return { status: res.status };
  }
  const json = await res.json();
  return json as StatusBody;
}

export async function addQuestion(
  question: QuestionFullBody
): Promise<StatusBody> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_NGINX}/api/internal/questions`,
    {
      method: "POST",
      body: JSON.stringify(question).replace(
        /(\"difficulty\":)\"([1-3])\"/,
        `$1$2`
      ),
    }
  );
  if (res.ok) {
    return { status: res.status };
  }
  const json = await res.json();
  return json as StatusBody;
}
