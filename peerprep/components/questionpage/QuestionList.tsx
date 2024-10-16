"use client";
import React, { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard";
import { Question, StatusBody, Difficulty, isError } from "@/api/structs";
import PeerprepDropdown from "../shared/PeerprepDropdown";
import PeerprepSearchBar from "../shared/PeerprepSearchBar";
import { useQuestionFilter } from "@/contexts/QuestionFilterContext";
// TODO make multiple select for topics at least
const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [topicsList, setTopicsList] = useState<string[]>(["all"]);

  const { difficulty, setDifficulty, topics, setTopics } = useQuestionFilter();

  useEffect(() => {
    const fetchQuestions = async () => {
      const payload = await fetch(
        `${process.env.NEXT_PUBLIC_NGINX}/api/internal/questions`
      ).then((res) => res.json());
      // uh
      if (isError(payload)) {
        // should also reflect the error
        return;
      }
      const data: Question[] = payload;

      setLoading(false);
      setQuestions(data);

      // get all present topics in all qns
      const uniqueTopics = Array.from(
        new Set(data.flatMap((question) => question.topicTags))
      );
      setTopicsList(["all", ...uniqueTopics]);
    };

    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const matchesDifficulty =
      difficulty === Difficulty.All ||
      Difficulty[question.difficulty] === difficulty;
    const matchesTopic =
      topics[0] === "all" || (question.topicTags ?? []).includes(topics[0]);
    const matchesSearch =
      searchFilter === "" ||
      (question.title ?? "").toLowerCase().includes(searchFilter.toLowerCase());

    return matchesDifficulty && matchesTopic && matchesSearch;
  });

  const sortedQuestions = filteredQuestions.sort((a, b) => a.id - b.id);

  return (
    <div className="flex-grow max-h-screen overflow-y-auto p-4">
      <div className="flex space-x-4 mb-4 items-end">
        <PeerprepSearchBar
          value={searchFilter}
          label="Search questions..."
          onChange={(e) => setSearchFilter(e.target.value)}
        />
        <PeerprepDropdown
          label="Difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          options={Object.keys(Difficulty).filter((key) => isNaN(Number(key)))}
        />
        <PeerprepDropdown
          label="Topics"
          value={topics[0]}
          onChange={(e) => setTopics([e.target.value])}
          options={topicsList}
        />
      </div>

      {loading ? (
        <p>Loading questions...</p>
      ) : (
        <div>
          {sortedQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionList;
