"use client";
import React from "react";
import { Difficulty, Question } from "@/api/structs";
import Chip from "@/components/shared/Chip";
import styles from "@/style/question.module.css";
import CollabEditor from "@/components/questionpage/CollabEditor";
import DOMPurify from "isomorphic-dompurify";

interface Props {
  question: Question;
  roomID?: string;
  authToken?: string;
  userId?: string;
  matchHash?: string;
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

function QuestionBlock({
  question,
  roomID,
  authToken,
  userId,
  matchHash,
}: Props) {
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
        <CollabEditor
          roomID={roomID}
          authToken={authToken}
          matchHash={matchHash}
          userId={userId}
        />
      </div>
    </>
  );
}

export default QuestionBlock;
