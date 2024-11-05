"use client";

import "@/style/tiptap.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { MenuBar } from "@/components/modifyQuestion/MenuBar";

type TipTapProps = {
  defaultContent: string;
  onChange: (richText: string) => void;
};

const Tiptap = ({ defaultContent, onChange }: TipTapProps) => {
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
    content: defaultContent,
    immediatelyRender: false, // needed if used in a server component
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="h-96">
      <MenuBar editor={editor} />

      <div
        className="editor-content h-80 resize-y overflow-y-auto overflow-x-hidden rounded-md border bg-gray-1 p-2"
        style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
