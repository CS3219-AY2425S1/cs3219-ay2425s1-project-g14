"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PeerprepButton from "../shared/PeerprepButton";
import { useQuestionFilter } from "@/contexts/QuestionFilterContext";
import { useUserInfo } from "@/contexts/UserInfoContext";

const QUERY_INTERVAL_MILLISECONDS = 2000;

const getMatchRequestTime = (): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formattedDate = now.toLocaleString("en-CA", options); // gives YYYY-MM-DD, HH:mm:ss
  const finalDate = formattedDate.replace(",", "").replace(/:/g, "-");

  return finalDate;
};

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
  const { userid } = useUserInfo();

  const handleMatch = () => {
    if (!isMatching) {
      setIsMatching(true);
      console.log("Match attempted");
      console.log("Selected Difficulty:", difficulty);
      console.log("Selected Topics:", topics);
      console.debug("Request time: ", getMatchRequestTime());
      console.debug("User id: ", userid);
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
    <div className="p-4 flex flex-row items-center space-x-4">
      <PeerprepButton onClick={() => router.push(`questions/new`)}>
        Add Question
      </PeerprepButton>
      <div className="flex flex-row items-center space-x-4">
        <PeerprepButton onClick={handleMatch}>
          {isMatching ? "Cancel Match" : "Find Match"}
        </PeerprepButton>
        {isMatching && (
          <div className="w-5 h-5 bg-difficulty-hard rounded-full ml-2" />
        )}
      </div>
    </div>
  );
};

export default Matchmaking;
