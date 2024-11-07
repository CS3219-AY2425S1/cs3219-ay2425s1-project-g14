import React from "react";
import QuestionList from "@/components/questionpage/QuestionList";
import Matchmaking from "@/components/questionpage/Matchmaking";
import { QuestionFilterProvider } from "@/contexts/QuestionFilterContext";
import { hydrateUid } from "../actions/server_actions";
import { isError, Question, StatusBody, UserData } from "@/api/structs";
import { UserInfoProvider } from "@/contexts/UserInfoContext";
import { fetchAllQuestions } from "@/app/questions/helper";

async function QuestionsPage() {
  const userData = (await hydrateUid()) as UserData;

  const questions: Question[] | StatusBody = await fetchAllQuestions();

  if (isError(questions)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-2xl">Error...</div>
      </div>
    );
  }

  return (
    <UserInfoProvider userData={userData}>
      <QuestionFilterProvider>
        <div className="flex h-screen flex-col overflow-hidden">
          <div className="sticky top-0">
            <Matchmaking />
          </div>
          <div className="flex-grow overflow-y-auto">
            <QuestionList questions={questions as unknown as Question[]} />
          </div>
        </div>
      </QuestionFilterProvider>
    </UserInfoProvider>
  );
}

export default QuestionsPage;
