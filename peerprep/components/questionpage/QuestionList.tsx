"use client";
import React, { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard";
import { Question, StatusBody, Difficulty } from "@/api/structs";
import PeerprepDropdown from "../shared/PeerprepDropdown";
import PeerprepSearchBar from "../shared/PeerprepSearchBar";

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>(
    Difficulty[0]
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  // will prolly have to search by name later
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [categories, setCategories] = useState<string[]>(["all"]);

  useEffect(() => {
    // uhhhhh this should be changed to fetch on filter/search change
    // make use of gateway.ts later
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions`
        );
        const data: Question[] = await response.json();
        setQuestions(data);

        // get all present categories in all qns
        const uniqueCategories = Array.from(
          new Set(data.flatMap((question) => question.categories))
        );
        setCategories(["all", ...uniqueCategories]);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
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
