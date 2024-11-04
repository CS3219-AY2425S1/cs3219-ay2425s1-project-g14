"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";

import { Difficulty, QuestionSchema } from "@/api/structs";
import { useRouter } from "next/navigation";
import { exampleQuestion } from "@/app/questions/new/ExampleQuestion";
import { zodResolver } from "@hookform/resolvers/zod";
import QuestionForm from "@/app/questions/QuestionForm";
import { addQuestion } from "@/app/api/internal/questions/helper";
import { toast } from "@/hooks/use-toast";

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
      toast({
        title: "Failed to add question.",
        description: `Code ${status.status}:  ${status.error}`,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: `Add successful.`,
    });
    router.push("/questions");
  };

  return (
    <div className="flex h-screen items-center justify-center overflow-y-auto">
      <div className="flex w-2/3 max-w-xl flex-col content-center">
        <QuestionForm form={form} onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default NewQuestion;
