import React from "react";
import EditQuestion from "@/app/questions/edit/[question]/EditQuestion";
import { Question } from "@/api/structs";
import { revalidatePath } from "next/cache";

import { fetchQuestion } from "@/app/questions/helper";

type Props = {
  params: {
    question: number;
  };
};

const EditQuestionPage = async ({ params }: Props) => {
  const question = (await fetchQuestion(params.question)) as Question;
  console.log("Fetching question");
  revalidatePath("/questions");
  revalidatePath(`/questions/${params.question}`);
  revalidatePath(`/questions/edit/${params.question}`);

  return <EditQuestion question={question} />;
};

export default EditQuestionPage;
