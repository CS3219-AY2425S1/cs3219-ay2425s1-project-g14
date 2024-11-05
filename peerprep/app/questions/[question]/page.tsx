import { fetchQuestion } from "@/api/gateway";
import { isError, Question as QnType, StatusBody } from "@/api/structs";
import styles from "@/style/question.module.css";
import ErrorBlock from "@/components/shared/ErrorBlock";
import React from "react";
import QuestionBlock from "./question";

type Props = {
  params: {
    question: number;
  };
};

async function Question({ params }: Props) {
  const question = await fetchQuestion(params.question);

  return (
    <div className={styles.wrapper}>
      {isError(question) ? (
        <ErrorBlock err={question as StatusBody} />
      ) : (
        <QuestionBlock question={question as QnType} />
      )}
    </div>
  );
}

export default Question;
