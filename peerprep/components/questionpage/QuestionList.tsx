"use client";
import React, { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard";
import { Question, difficulties, categories } from "../shared/Question";
import PeerprepDropdown from "../shared/PeerprepDropdown";

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/data/dummyquestions.json");
        const data: Question[] = await response.json();
        setQuestions(data);
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
      difficultyFilter === "all" || question.difficulty === difficultyFilter;
    const matchesCategory =
      categoryFilter === "all" || question.category === categoryFilter;
    return matchesDifficulty && matchesCategory;
  });

  const sortedQuestions = filteredQuestions.sort((a, b) => a.id - b.id);

  return (
    <div className="flex-grow max-h-screen overflow-y-auto p-4">
      <div className="flex space-x-4 mb-4">
        <PeerprepDropdown
          label="Difficulty"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          options={difficulties}
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
