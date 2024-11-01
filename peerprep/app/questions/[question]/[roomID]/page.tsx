import { fetchQuestion, getSessionToken } from "@/api/gateway";
import { Question as QnType, StatusBody, isError } from "@/api/structs";
import styles from "@/style/question.module.css";
import ErrorBlock from "@/components/shared/ErrorBlock";
import React from "react";
import QuestionBlock from "./question";

type Props = {
  searchParams: {
    match?: string
  },
  params: {
    question: string;
    roomID: string;
  };
};

async function Question({ params, searchParams }: Props) {
  const question = await fetchQuestion(params.question);

  return (
    <div className={styles.wrapper}>
      {isError(question) ? (
        <ErrorBlock err={question as StatusBody} />
      ) : (
        <QuestionBlock
          question={question as QnType}
          roomID={params.roomID}
          authToken={getSessionToken()}
          matchHash={searchParams.match}
        />
      )}
    </div>
  );
}

export default Question;
