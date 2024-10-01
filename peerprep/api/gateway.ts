import { Question, StatusBody, QuestionFullBody } from "./structs";

const questions: { [key: string]: Question } = {
  "0": {
    id: 0,
    difficulty: 2,
    title: "Two Sum",
    description:
      "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
    categories: ["Hash Table", "Array"],
    test_cases: {
      "[2, 7, 11, 15], 9": "[0, 1]",
      "[3, 2, 4], 6": "[1, 2]",
      "[3, 3], 6": "[0, 1]",
    },
  },
  "1": {
    id: 1,
    difficulty: 1,
    title: "Reverse Integer",
    description: "Given a 32-bit signed integer, reverse digits of an integer.",
    categories: ["Math"],
    test_cases: {
      "123": "321",
      "1": "1",
      "22": "22",
    },
  },
};

export async function fetchQuestion(
  questionId: string
): Promise<Question | StatusBody> {
  // remove this when services are up
  if (process.env.DEV_ENV === "dev") {
    return questions[questionId] === undefined
      ? { error: "Question not found", status: 404 }
      : questions[questionId];
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions/solve/${questionId}`
    );
    if (!response.ok) {
      return {
        error: await response.text(),
        status: response.status,
      };
    }
    return (await response.json()) as Question;
  } catch (err: any) {
    return { error: err.message, status: 400 };
  }
}

export async function addQuestion(body: QuestionFullBody): Promise<StatusBody> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions`,
      {
        method: "POST",
        body: JSON.stringify(body).replace(
          /(\"difficulty\":)\"([1-3])\"/,
          `$1$2`
        ),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    );
    if (response.ok) {
      return {
        status: response.status,
      };
    }
    return {
      error: (await response.json())["Error adding question: "],
      status: response.status,
    };
  } catch (err: any) {
    return { error: err.message, status: 0 };
  }
}

export async function deleteQuestion(question: Question): Promise<StatusBody> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions/delete/${question.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    );
    if (response.ok) {
      return {
        status: response.status,
      };
    }
    return {
      error: (await response.json())["Error deleting question: "],
      status: response.status,
    };
  } catch (err: any) {
    return { error: err.message, status: 0 };
  }
}

export async function getAllQuestions(): Promise<Question[] | StatusBody> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions`
    );
    if (!response.ok) {
      return {
        error: await response.text(),
        status: response.status,
      };
    }
    return (await response.json()) as Question[];
  } catch (err: any) {
    return { error: err.message, status: 400 };
  }
}
