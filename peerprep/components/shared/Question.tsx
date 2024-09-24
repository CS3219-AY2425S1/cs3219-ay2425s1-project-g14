export interface Question {
  id: number;
  title: string;
  description: string;
  category: (typeof categories)[number];
  difficulty: (typeof difficulties)[number];
  test_cases: {
    [key: string]: string;
  };
}

export const difficulties = ["all", "easy", "medium", "hard"] as string[];

export const categories = [
  "all",
  "Array",
  "Linked List",
  "String",
  "Dynamic Programming",
  "Tree",
] as string[];
