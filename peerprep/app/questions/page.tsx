import React from "react";
import QuestionList from "@/components/questionpage/QuestionList";
import Matchmaking from "@/components/questionpage/Matchmaking";
import { QuestionFilterProvider } from "@/contexts/QuestionFilterContext";

const QuestionsPage = () => {
  return (
    <QuestionFilterProvider>
      <Matchmaking></Matchmaking>
      <QuestionList></QuestionList>
    </QuestionFilterProvider>
  );
};

export default QuestionsPage;
