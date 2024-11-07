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
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="flex min-h-80 flex-col">
      <MenuBar editor={editor} />

      <EditorContent
        editor={editor}
        className="flex h-full flex-1 resize-y flex-col overflow-y-auto overflow-x-hidden rounded-md border bg-[#121212] p-2"
      />
    </div>
  );
};

export default Tiptap;
