"use client";
import React from "react";
import { Difficulty, Question } from "@/api/structs";
import PeerprepButton from "../shared/PeerprepButton";
import { useRouter } from "next/navigation";
import styles from "@/style/questionCard.module.css";
import { deleteQuestion } from "@/app/questions/helper";
import DOMPurify from "isomorphic-dompurify";
import { useUserInfo } from "@/contexts/UserInfoContext";

type QuestionCardProps = {
  question: Question;
};

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const router = useRouter();
  // Note that this is purely UI, there are additional checks in the API call
  const userData = useUserInfo();
  const isAdmin = userData.isAdmin;

  const handleDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete ${question.title}? (ID: ${question.id}) `,
      )
    ) {
      const status = await deleteQuestion(question.id);
      router.refresh();
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
  const handleEdit = () => {
    router.push(`questions/edit/${question.id}`);
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

  const questionContent = DOMPurify.sanitize(question.content);

  const match = questionContent.match(/(.*?)(?=<\/p>)/);
  const questionContentSubstring =
    (match ? match[0] : "No description found") + "...";

  return (
    <div className={styles.container}>
      <div className="w-full flex-none sm:w-1/3">
        <h2 className={styles.title}>{question.title}</h2>
        <p className={styles.bodytext}>
          Difficulty:{" "}
          <span
            className={`font-bold capitalize ${getDifficultyColor(
              question.difficulty,
            )}`}
          >
            {Difficulty[question.difficulty]}
          </span>
        </p>
        <p className={styles.bodytext}>
          Topics:{" "}
          <span>
            {question.topicTags ? question.topicTags.join(", ") : "None"}
          </span>
        </p>
      </div>

      <div className="max-h-16 w-full flex-none overflow-hidden sm:w-1/2">
        {
          <div
            className={styles.bodytext}
            dangerouslySetInnerHTML={{ __html: questionContentSubstring }}
          />
        }
      </div>

      <div className={styles.buttonContainer}>
        <PeerprepButton
          onClick={() => router.push(`/questions/${question.id}`)}
        >
          View
        </PeerprepButton>
        {isAdmin && <PeerprepButton onClick={handleEdit}>Edit</PeerprepButton>}
        {isAdmin && (
          <PeerprepButton onClick={handleDelete}>Delete</PeerprepButton>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
