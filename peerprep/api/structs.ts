import { z, ZodType } from "zod";

export enum Difficulty {
  All = "All",
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

export interface QuestionBody {
  difficulty: Difficulty;
  title: string;
  content: string;
  topicTags: string[];
}

// TODO remove this (unused)
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface QuestionFullBody extends QuestionBody {}

export interface Question extends QuestionFullBody {
  id: number;
}

export interface StatusBody {
  status: number;
  error?: string;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: number;
}

export interface UserDataAccessToken extends UserData {
  accessToken: string;
}

export interface LoginResponse {
  message: string;
  data: UserDataAccessToken;
}

export interface UserServiceResponse {
  message: string;
  data: UserData;
}

export interface MatchRequest {
  userId: string;
  topicTags: string[];
  difficulty: string;
  requestTime: string;
}

export interface MatchReqInitRes {
  match_code: string;
}

export interface MatchData {
  roomId: string;
  user1: string;
  user2: string;
  questionId: string;
}

export interface MatchResponse {
  isMatchFound: boolean;
  data: MatchData;
}

// credit - taken from Next.JS Auth tutorial
export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const SignupFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    // .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    // .regex(/[0-9]/, { message: "Contain at least one number." })
    // .regex(/[^a-zA-Z0-9]/, {
    //   message: "Contain at least one special character.",
    // })
    .trim(),
});

// TODO: remove `any`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isError(obj: any | StatusBody): obj is StatusBody {
  return (obj as StatusBody).status !== undefined;
}

export type Language = "javascript" | "python" | "c_cpp";
// maybe this shud be in structs
export type FormatResponse = {
  formatted_code: string;
};

export const QuestionSchema = z.object({
  difficulty: z.nativeEnum(Difficulty),
  title: z.string().min(2, {
    message: "Please input a title.",
  }),
  content: z.string().min(2, {
    message: "Please input content.",
  }),
  topicTags: z.array(z.string()).min(1, {
    message: "Please input at least one topic tag.",
  }),
}) satisfies ZodType<QuestionFullBody>;
