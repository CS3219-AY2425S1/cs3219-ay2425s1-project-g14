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

  const stopTimer = () => {
    // if user manually stopped it clear timeout
    if (timeout.current) {
      console.debug("Match request timeout stopped");
      clearTimeout(timeout.current);
    }
  };

  const handleMatch = async () => {
    if (!isMatching) {
      setIsMatching(true);

      // start 30s timeout
      timeout.current = setTimeout(() => {
        setIsMatching(false);
        console.log("Match request timed out after 30s");
      }, TIMEOUT_MILLISECONDS);

      // assemble the match request
      const matchRequest: MatchRequest = {
        userId: userid,
        difficulty: difficulty,
        topicTags: topics,
        requestTime: getMatchRequestTime(),
      };
      console.log("Match attempted");
      console.debug(matchRequest);

      // send match request
      const status = await findMatch(matchRequest);
      if (status.error) {
        stopTimer();
        console.log("Failed to find match. Cancel matching.");
        setIsMatching(false);
        return;
      }
      console.log(`Started finding match.`);
    } else {
      stopTimer();
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
    stopTimer();
    setIsMatching(false);
    // TODO: iron out what is in a match response and sync up with collab service rooms
    const matchRes: MatchResponse = res as MatchResponse;
    console.log("Match found!");
    // display in a popup for now
    const message = `Room ID: ${matchRes.data.roomId}
    User1: ${matchRes.data.user1}
    User2: ${matchRes.data.user2}`;
    window.alert(message);
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
