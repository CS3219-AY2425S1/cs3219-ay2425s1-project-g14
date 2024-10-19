"use client";
import React from "react";
import { Difficulty, Question } from "@/api/structs";
import Chip from "@/components/shared/Chip";
import PeerprepButton from "@/components/shared/PeerprepButton";
import styles from "@/style/question.module.css";
import { useRouter } from "next/navigation";
import { deleteQuestion } from "@/app/api/internal/questions/helper";
import CollabEditor from "@/components/questionpage/CollabEditor";
import DOMPurify from "dompurify";

interface Props {
  question: Question;
}

interface DifficultyChipProps {
  diff: Difficulty;
}

function DifficultyChip({ diff }: DifficultyChipProps) {
  return diff === Difficulty.Easy ? (
    <Chip className={styles.easy}>Easy</Chip>
  ) : diff === Difficulty.Medium ? (
    <Chip className={styles.med}>Med</Chip>
  ) : (
    <Chip className={styles.hard}>Hard</Chip>
  );
}

function QuestionBlock({ question }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete ${question.title}? (ID: ${question.id}) `,
      )
    ) {
      const status = await deleteQuestion(question.id);
      if (status.error) {
        alert(
          `Failed to delete question. Code ${status.status}:  ${status.error}`,
        );
        return;
      }
      console.log(`Successfully deleted the question.`);
      router.push("/questions");
    } else {
      console.log("Deletion cancelled.");
    }
  };

  return (
    <>
      <div className={styles.qn_container}>
        <div className={styles.title_wrapper}>
          <div className={styles.label_wrapper}>
            <h1 className={styles.title}>
              Q{question.id}: {question.title}
            </h1>
            <DifficultyChip diff={question.difficulty} />
          </div>
          <PeerprepButton
            className={` ${styles.button}`}
            onClick={handleDelete}
          >
            Delete
          </PeerprepButton>
        </div>
        <div className={styles.label_wrapper}>
          <p>Topics: </p>
          {question.topicTags.length == 0 ? (
            <p>No topics listed.</p>
          ) : (
            question.topicTags.map((elem, idx) => (
              <p key={idx} className={styles.label_shadow}>
                {elem}
              </p>
            ))
          )}
        </div>
        {
          <div
            className={styles.editorHTML}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(question.content),
            }}
          />
        }
      </div>
      <div className={styles.editor_container}>
        <CollabEditor question={question} />
      </div>
    </>
  );
}

export default QuestionBlock;
