"use client";
import { Difficulty } from "@/api/structs";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface QuestionFilterContextType {
  difficulties: string[];
  topicList: string[];
  setTopicList: (topics: string[]) => void;
}

const QuestionFilterContext = createContext<
  QuestionFilterContextType | undefined
>(undefined);

export const QuestionFilterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const difficulties = [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard];
  const [topicList, setTopicList] = useState<string[]>([]);
  // I guess default set this too the whole list of topics from questionlist
  // can also consider moving all the uniqu topics here? -- yes, we are doing that now
  // TODO: since QuestionFilterProvider now exists to wrap the QuestionList, 
  //       we can move the question fetching 1 layer higher, theoretically, so look into this

  return (
    <QuestionFilterContext.Provider
      value={{ difficulties, topicList, setTopicList }}
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
