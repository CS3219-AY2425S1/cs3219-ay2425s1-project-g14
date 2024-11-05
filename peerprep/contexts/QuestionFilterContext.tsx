"use client";
import { Difficulty } from "@/api/structs";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface QuestionFilterContextType {
  difficulties: Difficulty[];
  difficultyFilter: string;
  setDifficultyFilter: (difficulty: string) => void;
  topicList: string[];
  setTopicList: (topics: string[]) => void;
  topicFilter: string;
  setTopicFilter: (topic: string) => void;
}

const QuestionFilterContext = createContext<
  QuestionFilterContextType | undefined
>(undefined);

export const QuestionFilterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const difficulties = Object.values(Difficulty);
  const [difficultyFilter, setDifficultyFilter] = useState<string>(
    Difficulty.All,
  );
  const [topicList, setTopicList] = useState<string[]>([]);
  const [topicFilter, setTopicFilter] = useState<string>("all");

  return (
    <QuestionFilterContext.Provider
      value={{
        difficulties,
        difficultyFilter,
        setDifficultyFilter,
        topicList,
        setTopicList,
        topicFilter,
        setTopicFilter,
      }}
    >
      {children}
    </QuestionFilterContext.Provider>
  );
};

export const useQuestionFilter = (): QuestionFilterContextType => {
  const context = useContext(QuestionFilterContext);
  if (!context) {
    throw new Error(
      "useQuestionFilter must be used within a QuestionFilterProvider,
    );
  }
  return context;
};
