"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Question, QuestionSchema } from "@/api/structs";
import { editQuestion } from "@/app/questions/helper";
import QuestionForm from "@/app/questions/QuestionForm";
import { useRouter } from "next/navigation";

const EditQuestion = ({ question }: { question: Question }) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof QuestionSchema>>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      title: question.title,
      difficulty: question.difficulty,
      content: question.content,
      topicTags: question.topicTags,
    },
  });

  const onSubmit = async (values: z.infer<typeof QuestionSchema>) => {
    console.log(values);
    const qn: Question = {
      id: question.id,
      ...values,
    };
    const status = await editQuestion(qn);
    console.log(status);
    if (status.error) {
      console.log("Failed to add question.");
      console.log(`Code ${status.status}:  ${status.error}`);
      alert(`Failed to add question. Code ${status.status}:  ${status.error}`);
      return;
    }
    console.log(`Successfully modified the question.`);
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

export default EditQuestion;
