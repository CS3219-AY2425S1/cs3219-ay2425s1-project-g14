import { getSessionToken, getUserData } from "@/api/gateway";
import { isError, Question as QnType, StatusBody } from "@/api/structs";
import styles from "@/style/question.module.css";
import ErrorBlock from "@/components/shared/ErrorBlock";
import React from "react";
import QuestionBlock from "./question";
import { fetchQuestion } from "@/app/questions/helper";

type Props = {
  searchParams: {
    match?: string;
  };
  params: {
    question: number;
    roomID: string;
  };
};

async function Question({ params, searchParams }: Props) {
  const question = await fetchQuestion(params.question);
  const authToken = getSessionToken();
  const userData = getUserData();
  let userId;
  try {
    userId = JSON.parse(userData as string)?.id;
  } catch (err) {
    console.log("Failed to parse userid");
  }

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
          matchHash={searchParams.match}
        />
      )}
    </div>
  );
}

export default Question;
