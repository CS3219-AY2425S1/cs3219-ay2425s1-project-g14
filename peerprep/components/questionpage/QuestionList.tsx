"use client";
import React, { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard";
import { Question, StatusBody, Difficulty, isError } from "@/api/structs";
import PeerprepDropdown from "../shared/PeerprepDropdown";
import PeerprepSearchBar from "../shared/PeerprepSearchBar";

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>(
    Difficulty.All
  );
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [topics, setTopics] = useState<string[]>(["all"]);

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
      setTopics(["all", ...uniqueTopics]);
    };

    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const matchesDifficulty =
      difficultyFilter === Difficulty.All ||
      Difficulty[question.difficulty] === difficultyFilter;
    const matchesTopic =
      topicFilter === topics[0] ||
      (question.topicTags ?? []).includes(topicFilter);
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
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          options={Object.keys(Difficulty).filter((key) => isNaN(Number(key)))}
        />
        <PeerprepDropdown
          label="Topics"
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          options={topics}
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
