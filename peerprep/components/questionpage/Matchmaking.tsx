"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PeerprepButton from "../shared/PeerprepButton";
import { useQuestionFilter } from "@/contexts/QuestionFilterContext";
import { useUserInfo } from "@/contexts/UserInfoContext";
import { isError, MatchRequest, MatchResponse } from "@/api/structs";
import {
  checkMatchStatus,
  findMatch,
} from "@/app/api/internal/matching/helper";
import { match } from "assert";
import { TIMEOUT } from "dns";

const QUERY_INTERVAL_MILLISECONDS = 5000;
const TIMEOUT_MILLISECONDS = 30000;

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
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const { difficulty, topics } = useQuestionFilter();
  const { userid } = useUserInfo();
  const timeout = useRef<NodeJS.Timeout>();

  const handleMatch = async () => {
    if (!isMatching) {
      // start 30s timeout
      timeout.current = setTimeout(() => {
        setIsMatching(false);
        console.log("Match request timed out after 30s");
      }, TIMEOUT_MILLISECONDS);

      setIsMatching(true);
      const matchRequest: MatchRequest = {
        userId: userid,
        difficulty: difficulty,
        topicTags: topics,
        requestTime: getMatchRequestTime(),
      };
      console.log("Match attempted");
      console.debug(matchRequest);

      const status = await findMatch(matchRequest);
      if (status.error) {
        console.log("Failed to find match. Cancel matching.");
        setIsMatching(false);
        return;
      }
      console.log(`Started finding match.`);
    } else {
      // if user manually stopped it clear timeout
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      setIsMatching(false);
      console.log("User stopped matching");
    }
  };

  const queryResource = async () => {
    const res = await checkMatchStatus(userid);
    if (isError(res)) {
      // for now 404 means no match found so dont stop matching on error, let request timeout
      return;
    }
    setIsMatching(false);
    // TODO: iron out what is in a match response and sync up with collab service rooms
    const matchRes: MatchResponse = res as MatchResponse;
    console.log("Match found!");
    console.debug(matchRes);
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
          <div className="w-3 h-3 bg-difficulty-hard rounded-full ml-2" />
        )}
      </div>
    </div>
  );
};

export default Matchmaking;
