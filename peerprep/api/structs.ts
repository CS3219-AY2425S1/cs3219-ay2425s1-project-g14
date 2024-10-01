export enum Difficulty {
  All = 0,
  Easy = 1,
  Medium,
  Hard,
}

export interface QuestionBody {
  difficulty: Difficulty;
  title: string;
  description: string;
  categories: string[];
}

export interface TestCase {
  test_cases: {
    [key: string]: string;
  };
}

export interface QuestionFullBody extends QuestionBody, TestCase {}

export interface Question extends QuestionFullBody {
  id: number;
}

export interface StatusBody {
  status: number;
  error?: string;
}

export function isError(
  obj: Question[] | Question | StatusBody
): obj is StatusBody {
  return (obj as StatusBody).status !== undefined;
}
