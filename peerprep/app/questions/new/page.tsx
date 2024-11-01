"use client";

import { Controller, useForm } from "react-hook-form";
import { z, ZodNativeEnum, ZodType } from "zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import Tiptap from "@/components/modifyQuestion/Tiptap";
import { zodResolver } from "@hookform/resolvers/zod";
import { Difficulty, QuestionFullBody } from "@/api/structs";
import { useRouter } from "next/navigation";
import { InputTags } from "@/components/ui/tags";
import { exampleQuestion } from "@/app/questions/new/ExampleQuestion";
import { addQuestion } from "@/app/api/internal/questions/helper";

const QuestionSchema = z.object({
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
    <div className="flex h-screen items-center justify-center">
      <div className="flex w-2/3 max-w-xl flex-col content-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Two Sum" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Difficulty.Easy}>Easy</SelectItem>
                      <SelectItem value={Difficulty.Medium}>Medium</SelectItem>
                      <SelectItem value={Difficulty.Hard}>Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topicTags"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col items-start">
                  <FormLabel className="text-left">Topics</FormLabel>
                  <FormControl className="w-full">
                    <Controller
                      name="topicTags"
                      control={form.control}
                      render={({ field }) => (
                        <InputTags
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Press 'Enter' to add topics. "
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Tiptap
                      defaultContent={exampleQuestion}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewQuestion;
