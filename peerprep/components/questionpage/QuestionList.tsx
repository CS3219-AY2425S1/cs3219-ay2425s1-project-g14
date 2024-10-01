"use client";
import { getAllQuestions } from "@/api/gateway";
import React, { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard";
import { Question, StatusBody, Difficulty, isError } from "@/api/structs";
import PeerprepDropdown from "../shared/PeerprepDropdown";
import PeerprepSearchBar from "../shared/PeerprepSearchBar";

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>(
    Difficulty[0]
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [categories, setCategories] = useState<string[]>(["all"]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const data = await getAllQuestions();
      // uh
      if (isError(data)) {
        // should also reflect the error
        return;
      }

      setLoading(false);
      setQuestions(data);

      // get all present categories in all qns
      const uniqueCategories = Array.from(
        new Set(data.flatMap((question) => question.categories))
      );
      setCategories(["all", ...uniqueCategories]);
    };

    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const matchesDifficulty =
      difficultyFilter === Difficulty[0] ||
      Difficulty[question.difficulty] === difficultyFilter;
    const matchesCategory =
      categoryFilter === categories[0] ||
      (question.categories ?? []).includes(categoryFilter);
    const matchesSearch =
      searchFilter === "" ||
      (question.title ?? "").toLowerCase().includes(searchFilter.toLowerCase());

    return matchesDifficulty && matchesCategory && matchesSearch;
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
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={categories}
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
