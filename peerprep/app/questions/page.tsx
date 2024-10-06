import React from "react";
import QuestionList from "@/components/questionpage/QuestionList";
import Matchmaking from "@/components/questionpage/Matchmaking";

const QuestionsPage = () => {
  return (
    <div>
      <Matchmaking></Matchmaking>
      <QuestionList></QuestionList>
    </div>
  );
};

export default QuestionsPage;
