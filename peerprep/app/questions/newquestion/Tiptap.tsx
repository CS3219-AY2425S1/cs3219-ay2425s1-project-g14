"use client";

import "@/style/tiptap.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import { exampleQuestion } from "@/app/questions/newquestion/ExampleQuestion";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { MenuBar } from "@/app/questions/newquestion/MenuBar";
// load all languages with "all" or common languages with "common"

// create a lowlight instance with all languages loaded

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Subscript,
      Superscript,
      Underline,

      Link,
      Placeholder.configure({
        placeholder: "Add your question here",
      }),
    ],
    content: exampleQuestion,
    immediatelyRender: false,
  });

  return (
    <div className="h-96">
      <MenuBar editor={editor} />
      <div className="editor-content h-80 resize-y overflow-y-auto rounded-md border bg-gray-1 p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
