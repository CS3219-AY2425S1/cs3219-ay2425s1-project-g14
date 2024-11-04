"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PeerprepButton from "../shared/PeerprepButton";
import { useQuestionFilter } from "@/contexts/QuestionFilterContext";
import { useUserInfo } from "@/contexts/UserInfoContext";
import {
  Difficulty,
  isError,
  MatchRequest,
  MatchResponse,
} from "@/api/structs";
import {
  checkMatchStatus,
  findMatch,
} from "@/app/api/internal/matching/helper";
import ResettingStopwatch from "../shared/ResettingStopwatch";
import PeerprepDropdown from "../shared/PeerprepDropdown";

const QUERY_INTERVAL_MILLISECONDS = 1000;
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
  const [matchHash, setMatchHash] = useState<string>("");
  const { difficulties, topicList } = useQuestionFilter();
  const [difficultyFilter, setDifficultyFilter] = useState<string>(
    Difficulty.Easy
  );
  const [topicFilter, setTopicFilter] = useState<string[]>(topicList);
  const { userid } = useUserInfo();
  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setTopicFilter(topicList);
  }, [topicList]);

  const stopTimer = () => {
    // if user manually stopped it clear timeout
    if (timeout.current) {
      console.debug("Match request timeout stopped");
      clearTimeout(timeout.current);
    }
  };

  const getMatchMakingRequest = (): MatchRequest => {
    const matchRequest: MatchRequest = {
      userId: userid,
      difficulty: difficultyFilter,
      topicTags: topicFilter,
      requestTime: getMatchRequestTime(),
    };

    return matchRequest;
  };

  // TODO: Canceling the match should propagate a cancellation signal
  //       Currently, we can actually match yourself rn due to this change
  //       This indicates to me that 1 users can match on a cancellation
  const handleMatch = async () => {
    if (!isMatching) {
      setIsMatching(true);

      // start 30s timeout
      timeout.current = setTimeout(() => {
        setMatchHash("");
        setIsMatching(false);
        console.log("Match request timed out after 30s");
      }, TIMEOUT_MILLISECONDS);

      // assemble the match request
      const matchRequest = getMatchMakingRequest();
      console.log("Match attempted");
      console.debug(matchRequest);

      //   send match request
      const status = await findMatch(matchRequest);
      if (isError(status)) {
        stopTimer();
        console.log("Failed to find match. Cancel matching.");
        setMatchHash("");
        setIsMatching(false);
        return;
      }
      setMatchHash(status.match_code);
      console.log(`Started finding match.`);
    } else {
      setMatchHash("");
      stopTimer();
      setIsMatching(false);
      console.log("User stopped matching");
    }
  };

  const queryResource = async () => {
    const res = await checkMatchStatus(matchHash);
    if (isError(res)) {
      // for now 404 means no match found so dont stop matching on error, let request timeout
      return;
    }
    stopTimer();
    setIsMatching(false);
    // TODO: iron out what is in a match response and sync up with collab service rooms
    const matchRes: MatchResponse = res as MatchResponse;
    console.log("Match found!");
    router.push(
      `/questions/${matchRes.data.questionId}/${matchRes.data.roomId}?match=${matchHash}`
    );
  };

  usePeriodicCallback(queryResource, QUERY_INTERVAL_MILLISECONDS, isMatching);

  return (
    // TODO: move this to some admin panel or something
    <div className="p-4 flex flex-row items-center space-x-4">
      <PeerprepButton onClick={() => router.push(`questions/new`)}>
        Add Question
      </PeerprepButton>
      <div className="flex flex-row items-center space-x-4">
        <PeerprepButton onClick={handleMatch} disabled={!isMatching && matchHash !== ""}>
          {isMatching ? "Cancel Match" : matchHash === "" ? "Find Match" : "Redirecting..."}
        </PeerprepButton>
        {!isMatching && (
          <PeerprepDropdown
            label="Difficulty"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            // truthfully we don't need this difficulties list, but we are temporarily including it
            options={difficulties}
          />
        )}
        {!isMatching && (
          <PeerprepDropdown
            label="Topics"
            value={topicFilter[0]}
            onChange={(e) =>
              setTopicFilter(
                e.target.value === "all" ? topicList : [e.target.value]
              )
            }
            options={topicList}
          />
        )}
        {isMatching && <ResettingStopwatch isActive={isMatching} />}
      </div>
    </div>
  );
};

export default Matchmaking;
