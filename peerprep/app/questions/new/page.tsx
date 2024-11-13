"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";

import { Difficulty, QuestionSchema } from "@/api/structs";
import { useRouter } from "next/navigation";
import { exampleQuestion } from "@/app/questions/new/ExampleQuestion";
import { zodResolver } from "@hookform/resolvers/zod";
import QuestionForm from "@/app/questions/QuestionForm";
import { addQuestion } from "@/app/questions/helper";

const NewQuestion = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof QuestionSchema>>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      title: "",
      difficulty: Difficulty.Easy,
      content: exampleQuestion,
      topicTags: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof QuestionSchema>) => {
    console.log(values);
    const status = await addQuestion(values);
    if (status.error) {
      console.log("Failed to add question.");
      console.log(`Code ${status.status}:  ${status.error}`);
      return;
    }
    console.log(`Successfully added the question.`);
    router.push("/questions");
  };

  return (
    <div className="flex h-screen justify-center">
      <div className="w-2/3">
        <QuestionForm form={form} onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default NewQuestion;
