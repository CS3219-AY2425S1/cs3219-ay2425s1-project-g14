"use client";
import { Difficulty } from "@/api/structs";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface QuestionFilterContextType {
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  topics: string[];
  setTopics: (topics: string[]) => void;
}

const QuestionFilterContext = createContext<
  QuestionFilterContextType | undefined
>(undefined);

export const QuestionFilterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [difficulty, setDifficulty] = useState<string>(Difficulty.All); // default to all
  const [topics, setTopics] = useState<string[]>(["all"]); // I guess default set this too the whole list of topics from questionlist
  //can also consider moving all the uniqu topics here?

  return (
    <QuestionFilterContext.Provider
      value={{ difficulty, setDifficulty, topics, setTopics }}
    >
      {children}
    </QuestionFilterContext.Provider>
  );
};

export const useQuestionFilter = (): QuestionFilterContextType => {
  const context = useContext(QuestionFilterContext);
  if (!context) {
    throw new Error(
      "useQuestionFilter must be used within a QuestionFilterProvider"
    );
  }
  return context;
};
