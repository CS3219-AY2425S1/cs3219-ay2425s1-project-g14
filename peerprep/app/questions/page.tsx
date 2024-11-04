import React from "react";
import QuestionList from "@/components/questionpage/QuestionList";
import Matchmaking from "@/components/questionpage/Matchmaking";
import { QuestionFilterProvider } from "@/contexts/QuestionFilterContext";
import { UserInfoProvider } from "@/contexts/UserInfoContext";
import { hydrateUid } from "../actions/server_actions";

async function QuestionsPage() {
  const userId = await hydrateUid();
  return (
    <UserInfoProvider userid={userId}>
      <QuestionFilterProvider>
        <div className="flex max-h-screen flex-col">
          <Matchmaking></Matchmaking>
          <QuestionList></QuestionList>
        </div>
      </QuestionFilterProvider>
    </UserInfoProvider>
  );
}

export default QuestionsPage;
