"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PeerprepButton from "../shared/PeerprepButton";
import { useQuestionFilter } from "@/contexts/QuestionFilterContext";
const QUERY_INTERVAL_MILLISECONDS = 3000;
const usePeriodicCallback = (
  callback: () => void,
  intervalTime: number,
  isActive: boolean
) => {
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(callback, intervalTime);

    return () => clearInterval(interval);
  }, [callback, intervalTime, isActive]);
};

const Matchmaking = () => {
  const router = useRouter();
  const [isMatching, setIsMatching] = useState(false);
  const { difficulty, topics } = useQuestionFilter();

  const handleMatch = () => {
    if (!isMatching) {
      setIsMatching(true);
      console.log("Match attempted");
      console.log("Selected Difficulty:", difficulty);
      console.log("Selected Topics:", topics);
    } else {
      setIsMatching(false);
      console.debug("User stopped matching");
    }

    // username as userid?
    // should probably just use the questionlist selections as params
  };

  const queryResource = () => {
    console.debug("Querying resource blob for matchmaking status");
  };

  usePeriodicCallback(queryResource, QUERY_INTERVAL_MILLISECONDS, isMatching);

  return (
    // TODO: move this to some admin panel or something
    <div className="p-4 space-x-4">
      <PeerprepButton onClick={() => router.push(`questions/new`)}>
        Add Question
      </PeerprepButton>
      <PeerprepButton onClick={handleMatch}>
        {isMatching ? "Cancel Match" : "Find Match"}
      </PeerprepButton>
    </div>
  );
};

export default Matchmaking;
