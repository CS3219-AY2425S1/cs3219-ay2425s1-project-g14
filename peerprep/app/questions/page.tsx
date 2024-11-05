import React from "react";
import QuestionList from "@/components/questionpage/QuestionList";
import Matchmaking from "@/components/questionpage/Matchmaking";
import { QuestionFilterProvider } from "@/contexts/QuestionFilterContext";
import { UserInfoProvider } from "@/contexts/UserInfoContext";
import { hydrateUid } from "../actions/server_actions";
import { Question } from "@/api/structs";
import { generateAuthHeaders } from "@/api/gateway";

async function QuestionsPage() {
  const userId = await hydrateUid();

  const questions: Question[] = await fetch(
    `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions`,
    {
      method: "GET",
      headers: generateAuthHeaders(),
    },
  ).then((res) => res.json());

  return (
    <UserInfoProvider userid={userId}>
      <QuestionFilterProvider>
        <Matchmaking></Matchmaking>
        <QuestionList questions={questions}></QuestionList>
      </QuestionFilterProvider>
    </UserInfoProvider>
  );
}

export default QuestionsPage;
