import React from "react";
import QuestionList from "@/components/questionpage/QuestionList";
import Matchmaking from "@/components/questionpage/Matchmaking";
import { QuestionFilterProvider } from "@/contexts/QuestionFilterContext";
import { UserInfoProvider } from "@/contexts/UserInfoContext";

const QuestionsPage = () => {
  return (
    <UserInfoProvider>
      <QuestionFilterProvider>
        <Matchmaking></Matchmaking>
        <QuestionList></QuestionList>
      </QuestionFilterProvider>
    </UserInfoProvider>
  );
};

export default QuestionsPage;
