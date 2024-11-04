"use client";
import React, { use, useEffect, useRef, useState } from "react";
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
import { toast, useToast } from "@/hooks/use-toast";

const QUERY_INTERVAL_MILLISECONDS = 1000;
const TIMEOUT_MILLISECONDS = 5000;

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
  isActive: boolean,
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
  const { difficulties, topicList } = useQuestionFilter();
  const [difficultyFilter, setDifficultyFilter] = useState<string>(
    Difficulty.Easy,
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

  const handleMatch = async () => {
    if (!isMatching) {
      setIsMatching(true);
      toast({ title: "Finding match..." });

      // start 30s timeout
      timeout.current = setTimeout(() => {
        setIsMatching(false);
        toast({
          title: "Unable to find match.",
          description: "Try again later.",
        });
      }, TIMEOUT_MILLISECONDS);

      // assemble the match request
      const matchRequest = getMatchMakingRequest();

      console.debug(matchRequest);

      //   send match request
      const status = await findMatch(matchRequest);
      if (status.error) {
        stopTimer();
        toast({
          title: "Unable to find match.",
          description: "Try again later.",
        });
        setIsMatching(false);
        return;
      }
    } else {
      stopTimer();
      toast({ title: "Matchmaking cancelled." });
      setIsMatching(false);
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
    toast({
      title: "Match found!",
      description: "Redirecting to collab page...",
    });
    // redirect to question page
    router.push(
      `/questions/${matchRes.data.questionId}/${matchRes.data.roomId}`,
    );
  };

  usePeriodicCallback(queryResource, QUERY_INTERVAL_MILLISECONDS, isMatching);

  return (
    // TODO: move this to some admin panel or something
    <div className="flex flex-row items-center space-x-4 p-4">
      <PeerprepButton onClick={() => router.push(`questions/new`)}>
        Add Question
      </PeerprepButton>
      <div className="flex flex-row items-center space-x-4">
        <PeerprepButton onClick={handleMatch}>
          {isMatching ? "Cancel Match" : "Find Match"}
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
                e.target.value === "all" ? topicList : [e.target.value],
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
