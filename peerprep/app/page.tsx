import { redirect } from "next/navigation";

export default function Home() {
  redirect(`/questions`);
  // return <Link href="/questions">Questions</Link>;
}
