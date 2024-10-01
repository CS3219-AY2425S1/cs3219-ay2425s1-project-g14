"use client";
import { deleteQuestion } from "@/api/gateway";
import { Question, Difficulty } from "@/api/structs";
import Chip from "@/components/shared/Chip";
import PeerprepButton from "@/components/shared/PeerprepButton";
import styles from "@/style/question.module.css";
import { useRouter } from "next/navigation";

interface Props {
  question: Question;
}

interface DifficultyChipProps {
  diff: Difficulty;
}

function DifficultyChip({ diff }: DifficultyChipProps) {
  return diff === Difficulty.Easy ? (
    <Chip className={styles.easy}>Easy</Chip>
  ) : diff === Difficulty.Medium ? (
    <Chip className={styles.med}>Med</Chip>
  ) : (
    <Chip className={styles.hard}>Hard</Chip>
  );
}

function QuestionBlock({ question }: Props) {
  const router = useRouter();
  const keys = question.test_cases ? Object.keys(question.test_cases) : [];

  const createRow = (key: string) => (
    <tr key={key}>
      <td className={`${styles.table} ${styles.cell}`}>{key}</td>
      <td className={`${styles.table} ${styles.cell}`}>
        {question.test_cases[key]}
      </td>
    </tr>
  );

  const handleDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete ${question.title}? (ID: ${question.id}) `
      )
    ) {
      const status = await deleteQuestion(question);
      if (status.error) {
        alert(
          `Failed to delete question. Code ${status.status}:  ${status.error}`
        );
        return;
      }
      console.log(`Successfully deleted the question.`);
      router.push("/questions");
    } else {
      console.log("Deletion cancelled.");
    }
  };

  return (
    <>
      <div className={styles.qn_container}>
        <div className={styles.title_wrapper}>
          <div className={styles.label_wrapper}>
            <h1 className={styles.title}>
              Q{question.id}: {question.title}
            </h1>
            <DifficultyChip diff={question.difficulty} />
          </div>
          <PeerprepButton
            className={` ${styles.button}`}
            onClick={handleDelete}
          >
            Delete
          </PeerprepButton>
        </div>
        <div className={styles.label_wrapper}>
          <p>Categories: </p>
          {question.categories.length == 0 ? (
            <p>No categories listed.</p>
          ) : (
            question.categories.map((elem, idx) => <p key={idx}>{elem}</p>)
          )}
        </div>
        <p>{question.description}</p>
        <br />
        {question.test_cases && (
          <table className={styles.table}>
            <tbody>
              <tr>
                <th
                  className={`${styles.table} ${styles.header} ${styles.input}`}
                >
                  Input
                </th>
                <th
                  className={`${styles.table} ${styles.header} ${styles.output}`}
                >
                  Expected Output
                </th>
              </tr>
              {keys.map(createRow)}
            </tbody>
          </table>
        )}
      </div>
      <form className={styles.editor_container}>
        <textarea className={styles.code_editor} />
      </form>
    </>
  );
}

export default QuestionBlock;
