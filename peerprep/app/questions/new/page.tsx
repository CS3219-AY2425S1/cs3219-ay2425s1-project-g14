"use client";
import { useState, ChangeEvent, MouseEvent, FormEvent } from "react";
import { QuestionBody, Difficulty, QuestionFullBody } from "@/api/structs";
import { addQuestion } from "@/api/gateway";
import style from "@/style/form.module.css";
import FormTextInput from "@/components/shared/form/FormTextInput";
import RadioButtonGroup from "@/components/shared/form/RadioButtonGroup";
import FormTextAreaInput from "@/components/shared/form/FormTextAreaInput";
import { useRouter } from "next/navigation";

type Props = {};

interface Mapping {
  key: string;
  value: string;
}

function NewQuestion({}: Props) {
  const router = useRouter();
  // Form Data is handled as a single submission
  const [formData, setFormData] = useState<QuestionBody>({
    title: "",
    difficulty: Difficulty.Easy,
    description: "",
    categories: [],
  });
  // Choice 1: Test cases handled separately to allow modification of multiple fields
  const [testCases, setTestCases] = useState<Mapping[]>([]);
  // TODO: Resolve this mess of hooks to combine the form data
  const [mapping, setMapping] = useState<Mapping>({
    key: "",
    value: "",
  });
  // Choice 2: Categories handled in a separate state, inject into formData on confirm
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleCategoriesInput = (e: ChangeEvent<HTMLInputElement>) =>
    setCategory(e.target.value);
  const handleCategoryAdd = (e: MouseEvent<HTMLElement>) => {
    if (category.length == 0) return;
    setFormData({
      ...formData,
      categories: [...formData.categories, category],
    });
    setCategory("");
  };
  const handleCategoryDel = (
    e: MouseEvent<HTMLParagraphElement>,
    idx: number
  ) => {
    if (loading) return;
    const values = [...formData.categories];
    values.splice(idx, 1);
    setFormData({
      ...formData,
      categories: values,
    });
  };

  const handleFormTextInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) =>
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  const handleMappingInput = (e: ChangeEvent<HTMLInputElement>) =>
    setMapping({
      ...mapping,
      [e.target.name]: e.target.value,
    });

  const handleMappingAdd = (e: MouseEvent<HTMLElement>) => {
    if (mapping.key.length == 0 || mapping.value.length == 0) return;
    setTestCases([...testCases, mapping]);
    setMapping({ key: "", value: "" });
  };

  const handleMappingDel = (e: MouseEvent<HTMLElement>, idx: number) => {
    if (loading) return;
    const values = [...testCases];
    values.splice(idx, 1);
    setTestCases(values);
  };

  const handleSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const question: QuestionFullBody = {
      ...formData,
      test_cases: testCases
        .map((elem: Mapping) => ({
          [elem.key]: elem.value,
        }))
        .reduce((res, item) => ({ ...res, ...item }), {}),
    };
    const status = await addQuestion(question);
    if (status.error) {
      console.log("Failed to add question.");
      console.log(`Code ${status.status}:  ${status.error}`);
      setLoading(false);
      return;
    }
    console.log(`Successfully added the question.`);
    router.push("/questions");
  };

  return (
    <div className={style.wrapper}>
      <form className={style.form_container} onSubmit={handleSubmission}>
        <h1 className={style.title}>Create a new Question</h1>
        <FormTextInput
          required
          disabled={loading}
          label="Question Title: "
          name="title"
          value={formData.title}
          onChange={handleFormTextInput}
        />
        <RadioButtonGroup
          required
          disabled={loading}
          label="Difficulty: "
          group="difficulty"
          options={{ Easy: 1, Medium: 2, Hard: 3 }}
          onChange={handleFormTextInput}
        />
        <FormTextAreaInput
          required
          disabled={loading}
          label="Description: "
          name="description"
          value={formData.description}
          onChange={handleFormTextInput}
        />
        <FormTextInput
          disabled={loading}
          label="Categories: "
          name="categories"
          value={category}
          onChange={handleCategoriesInput}
        >
          <input
            type="button"
            onClick={handleCategoryAdd}
            value="Add"
            disabled={loading}
          />
        </FormTextInput>
        <div className={style.radio_container}>
          {formData.categories.length == 0 ? (
            <p className={style.disabledText}>No Categories added.</p>
          ) : (
            formData.categories.map((elem, idx) => (
              <p
                key={idx}
                className={style.deletableText}
                onClick={(e) => handleCategoryDel(e, idx)}
              >
                {elem}
              </p>
            ))
          )}
        </div>
        <div className={style.input_container}>
          <div>
            <FormTextInput
              disabled={loading}
              label="Test Case: "
              name="key"
              value={mapping.key}
              onChange={handleMappingInput}
            />
            <FormTextInput
              disabled={loading}
              label="Expected: "
              name="value"
              value={mapping.value}
              onChange={handleMappingInput}
            />
          </div>
          <input
            type="button"
            onClick={handleMappingAdd}
            value="Add"
            disabled={loading}
          />
        </div>
        {testCases.length == 0 ? (
          <p className={style.disabledText}>No Test Cases added.</p>
        ) : (
          testCases.map((elem, idx) => (
            <p
              key={idx}
              className={style.deletableText}
              onClick={(e) => handleMappingDel(e, idx)}
            >
              {elem.key}/{elem.value}
            </p>
          ))
        )}
        <button
          disabled={loading}
          type="submit"
          name="submit"
          className={`${style.title}`}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default NewQuestion;
