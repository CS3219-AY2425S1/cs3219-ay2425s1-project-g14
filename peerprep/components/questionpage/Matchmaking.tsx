"use client";
import React from "react";
import { useRouter } from "next/navigation";
import PeerprepButton from "../shared/PeerprepButton";
import { useQuestionFilter } from "@/contexts/QuestionFilterContext";

const Matchmaking = () => {
  const router = useRouter();
  const { difficulty, topics } = useQuestionFilter();

  const handleMatch = () => {
    console.log("Match attempted");
    console.log("Selected Difficulty:", difficulty);
    console.log("Selected Topics:", topics);
    // username as userid?
    // should probably just use the questionlist selections as params
  };

  return (
    // TODO: move this to some admin panel or something
    <div className="p-4 space-x-4">
      <PeerprepButton onClick={() => router.push(`questions/new`)}>
        Add Question
      </PeerprepButton>
      <PeerprepButton onClick={handleMatch}>Find Match</PeerprepButton>
    </div>
  );
};

export default Matchmaking;
