import Tiptap from "@/app/questions/newquestion/Tiptap";

const NewQuestion = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="mt-8 text-center text-3xl font-bold">
        Create a new question
      </h1>

      <div className="mt-4 w-full max-w-screen-md px-4">
        <p className="mb-2 text-left text-lg font-medium">Title</p>
        <input
          type="text"
          className="cur mb-4 w-full rounded-md border p-2 text-black caret-black"
          placeholder="Enter question title"
        />

        <p className="mb-2 text-left text-lg font-medium">Difficulty</p>
        <input
          type="text"
          className="mb-4 w-full rounded-md border p-2 text-black caret-black"
          placeholder="Enter question difficulty"
        />

        <p className="mb-2 text-left text-lg font-medium">Question Content</p>
        <div>
          <Tiptap />
        </div>
      </div>
    </div>
  );
};

export default NewQuestion;
