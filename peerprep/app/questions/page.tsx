import React from "react";
import QuestionList from "@/components/questionpage/QuestionList";
import Matchmaking from "@/components/questionpage/Matchmaking";
import { QuestionFilterProvider } from "@/contexts/QuestionFilterContext";
import { hydrateUid } from "../actions/server_actions";
import { Question } from "@/api/structs";
import { generateAuthHeaders } from "@/api/gateway";
import { UserInfoProvider } from "@/contexts/UserInfoContext";

async function QuestionsPage() {
  const userId = await hydrateUid();

  const questions: Question[] = await fetch(
    `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions`,
    {
      method: "GET",
      headers: generateAuthHeaders(),
      cache: "no-store",
    },
  ).then((res) => res.json());

  return (
    <UserInfoProvider userid={userId}>
      <QuestionFilterProvider>
        <div className="flex h-screen flex-col overflow-hidden">
          <div className="sticky top-0">
            <Matchmaking />
          </div>
          <div className="flex-grow overflow-y-auto">
            <QuestionList questions={questions} />
          </div>
        </div>
      </QuestionFilterProvider>
    </UserInfoProvider>
  );
}

export default QuestionsPage;
