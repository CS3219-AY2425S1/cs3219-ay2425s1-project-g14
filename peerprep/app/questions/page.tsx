import React from "react";
import QuestionList from "@/components/questionpage/QuestionList";
import Matchmaking from "@/components/questionpage/Matchmaking";
import { QuestionFilterProvider } from "@/contexts/QuestionFilterContext";
import { hydrateUid } from "../actions/server_actions";
import { isError, Question, StatusBody, UserData } from "@/api/structs";
import { UserInfoProvider } from "@/contexts/UserInfoContext";
import { fetchAllQuestions } from "@/app/questions/helper";
import { redirect } from "next/navigation";

async function QuestionsPage() {
  const userData = (await hydrateUid()) as UserData;

  if (!userData) {
    redirect("/auth/login");
  }

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
          <Matchmaking />
          <div className="flex-grow overflow-y-auto">
            <QuestionList questions={questions as unknown as Question[]} />
          </div>
        </div>
      </QuestionFilterProvider>
    </UserInfoProvider>
  );
}

export default QuestionsPage;
