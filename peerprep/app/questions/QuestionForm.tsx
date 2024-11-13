"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Difficulty, QuestionSchema } from "@/api/structs";
import { Controller, UseFormReturn } from "react-hook-form";
import { InputTags } from "@/components/ui/tags";
import Tiptap from "@/components/modifyQuestion/Tiptap";
import { Button } from "@/components/ui/button";
import { z } from "zod";

type FormType = UseFormReturn<
  {
    difficulty: Difficulty;
    title: string;
    content: string;
    topicTags: string[];
  },
  any,
  undefined
>;

type QuestionFormProps = {
  form: FormType;
  onSubmit: (values: z.infer<typeof QuestionSchema>) => Promise<void>;
};

const QuestionForm = ({ form, onSubmit }: QuestionFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Two Sum" {...field} />
              </FormControl>
              <FormDescription>Please input a title.</FormDescription>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormDescription>Please select a difficulty.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="topicTags"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel className="">Topics</FormLabel>
              <FormControl className="">
                <Controller
                  name="topicTags"
                  control={form.control}
                  render={({ field }) => (
                    <InputTags
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Press 'Enter' to add tags."
                    />
                  )}
                />
              </FormControl>
              <FormDescription>
                Please input at least one topic tag.
              </FormDescription>
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
                  defaultContent={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>Please input content.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={"border-blue-800 bg-blue-700 text-white hover:bg-blue-800"}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default QuestionForm;
