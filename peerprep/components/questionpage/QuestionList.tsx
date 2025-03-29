"use client";
import React, { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard";
import { Difficulty, Question } from "@/api/structs";
import PeerprepDropdown from "../shared/PeerprepDropdown";
import PeerprepSearchBar from "../shared/PeerprepSearchBar";
import { useQuestionFilter } from "@/contexts/QuestionFilterContext";

type Props = {
  questions: Question[];
};

// TODO make multiple select for topics at least
const QuestionList = ({ questions }: Props) => {
  const [searchFilter, setSearchFilter] = useState<string>("");

  const {
    topicList,
    setTopicList,
    difficultyFilter,
    setDifficultyFilter,
    topicFilter,
    setTopicFilter,
  } = useQuestionFilter();

  useEffect(() => {
    const uniqueTopics = Array.from(
      new Set(questions.flatMap((question) => question.topicTags)),
    );
    setTopicList(["all", ...uniqueTopics]);
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const matchesDifficulty =
      difficultyFilter === Difficulty.All ||
      Difficulty[question.difficulty] === difficultyFilter;
    const matchesTopic =
      topicFilter === "all" || (question.topicTags ?? []).includes(topicFilter);
    const matchesSearch =
      searchFilter === "" ||
      (question.title ?? "").toLowerCase().includes(searchFilter.toLowerCase());

    return matchesDifficulty && matchesTopic && matchesSearch;
  });

  const sortedQuestions = filteredQuestions.sort((a, b) => a.id - b.id);

  const handleSetDifficulty = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const diff = e.target.value;
    setDifficultyFilter(diff);
  };

  const handleSetTopics = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const topic = e.target.value;
    setTopicFilter(topic);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 mb-4 flex items-end space-x-4">
        <PeerprepSearchBar
          value={searchFilter}
          label="Search questions..."
          onChange={(e) => setSearchFilter(e.target.value)}
        />
        <PeerprepDropdown
          label="Difficulty"
          value={difficultyFilter}
          onChange={handleSetDifficulty}
          options={Object.keys(Difficulty).filter((key) => isNaN(Number(key)))}
        />
        <PeerprepDropdown
          label="Topics"
          value={topicFilter}
          onChange={handleSetTopics}
          options={topicList}
        />
      </div>

      <div className={""}>
        {sortedQuestions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
};

export default QuestionList;
