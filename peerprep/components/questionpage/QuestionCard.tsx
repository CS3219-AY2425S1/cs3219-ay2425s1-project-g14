"use client";
import { deleteQuestion } from "@/api/gateway";
import React from "react";
import { Question, Difficulty } from "@/api/structs";
import PeerprepButton from "../shared/PeerprepButton";
import { useRouter } from "next/navigation";
import styles from "@/style/questionCard.module.css";
import QuestionList from "./QuestionList";

type QuestionCardProps = {
  question: Question;
};

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const router = useRouter();
  const handleDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete ${question.title}? (ID: ${question.id}) `
      )
    ) {
      const status = await deleteQuestion(question);
      if (status.error) {
        console.log("Failed to delete question.");
        console.log(`Code ${status.status}:  ${status.error}`);
        return;
      }
      console.log(`Successfully deleted the question.`);
    } else {
      console.log("Deletion cancelled.");
    }
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.Easy:
        return "text-difficulty-easy"; // Green for easy
      case Difficulty.Medium:
        return "text-difficulty-med"; // Yellow for medium
      case Difficulty.Hard:
        return "text-difficulty-hard"; // Red for hard
      default:
        return "text-secondary-text"; // Default color
    }
  };

  return (
    <div className={styles.container}>
      <div className="flex-none w-full sm:w-1/3">
        <h2 className={styles.title}>{question.title}</h2>
        <p className={styles.bodytext}>
          Difficulty:{" "}
          <span
            className={`capitalize font-bold ${getDifficultyColor(
              question.difficulty
            )}`}
          >
            {Difficulty[question.difficulty]}
          </span>
        </p>
        <p className={styles.bodytext}>
          Categories:{" "}
          <span>
            {question.categories ? question.categories.join(", ") : "None"}
          </span>
        </p>
      </div>

      <div className="flex-none w-full sm:w-1/2 max-h-16">
        <p className={styles.bodytext}>{question.description}</p>
      </div>

      <div className={styles.buttonContainer}>
        <PeerprepButton onClick={() => router.push(`questions/${question.id}`)}>
          View
        </PeerprepButton>
        <PeerprepButton onClick={handleDelete}>Delete</PeerprepButton>
      </div>
    </div>
  );
};

export default QuestionCard;
