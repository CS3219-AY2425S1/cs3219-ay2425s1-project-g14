import { fetchQuestion, getSessionToken, getUserData } from "@/api/gateway";
import { isError, Question as QnType, StatusBody } from "@/api/structs";
import styles from "@/style/question.module.css";
import ErrorBlock from "@/components/shared/ErrorBlock";
import React from "react";
import QuestionBlock from "./question";

type Props = {
  params: {
    question: string;
    roomID: string;
  };
};

async function Question({ params }: Props) {
  const question = await fetchQuestion(params.question);
  const authToken = getSessionToken();
  const userData = getUserData();
  let userId;
  try {
    userId = JSON.parse(userData as string)?.id;
  } catch (err) {}

  return (
    <div className={styles.wrapper}>
      {isError(question) ? (
        <ErrorBlock err={question as StatusBody} />
      ) : (
        <QuestionBlock
          question={question as QnType}
          roomID={params.roomID}
          authToken={authToken}
          userId={userId}
        />
      )}
    </div>
  );
}

export default Question;
