import styles from "@/style/addquestion.module.css";

import React from "react";
import { Editor } from "@tiptap/core";
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Redo,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo,
} from "lucide-react";
import Tooltip from "./Tooltip";
import clsx from "clsx";

type Props = {
  editor: Editor | null;
};

export const MenuBar = ({ editor }: Props) => {
  if (!editor) {
    return null;
  }

  return (
    <div className={styles.buttonGroup}>
      <Tooltip text="Clear formatting">
        <button
          onClick={() => editor.commands.unsetAllMarks()}
          type={"button"}
          className={styles.button}
        >
          <RemoveFormatting className="h-5 w-5" />
        </button>
      </Tooltip>
      <Tooltip text="Bold">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          type={"button"}
          className={clsx(
            styles.button,
            editor.isActive("bold") && styles.isActive,
          )}
        >
          <Bold className="h-5 w-5" />
        </button>
      </Tooltip>

      <Tooltip text="Italics">
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          type={"button"}
          className={clsx(
            styles.button,
            editor.isActive("italic") && styles.isActive,
          )}
        >
          <Italic className="h-5 w-5" />
        </button>
      </Tooltip>

      <Tooltip text="Underline">
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          type={"button"}
          className={clsx(
            styles.button,
            editor.isActive("underline") && styles.isActive,
          )}
        >
          <Underline className="h-5 w-5" />
        </button>
      </Tooltip>

      <Tooltip text="Strikethrough">
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          type={"button"}
          className={clsx(
            styles.button,
            editor.isActive("strike") && styles.isActive,
          )}
        >
          <Strikethrough className="h-5 w-5" />
        </button>
      </Tooltip>

      <Tooltip text="Code">
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          type={"button"}
          className={clsx(
            styles.button,
            editor.isActive("code") && styles.isActive,
          )}
        >
          <Code className="h-5 w-5" />
        </button>
      </Tooltip>

      <Tooltip text="CodeBlock">
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          type={"button"}
          className={clsx(
            styles.button,
            editor.isActive("codeBlock") && "is-active",
          )}
        >
          <Code className="h-5 w-5" />
        </button>
      </Tooltip>

      <Tooltip text="Numbered list">
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          type={"button"}
          className={clsx(
            styles.button,
            editor.isActive("orderedList") && styles.isActive,
          )}
        >
          <ListOrdered className="h-5 w-5" />
        </button>
      </Tooltip>

      <Tooltip text="Bullet list">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          type={"button"}
          className={clsx(
            styles.button,
            editor.isActive("bulletList") && styles.isActive,
          )}
        >
          <List className="h-5 w-5" />
        </button>
      </Tooltip>

      <Tooltip text="Undo">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          type={"button"}
          disabled={!editor.can().undo()}
          className={styles.button}
        >
          <Undo className="h-5 w-5" />
        </button>
      </Tooltip>

      <Tooltip text="Redo">
        <button
          onClick={() => editor.chain().focus().redo().run()}
          type={"button"}
          disabled={!editor.can().redo()}
          className={styles.button}
        >
          <Redo className="h-5 w-5" />
        </button>
      </Tooltip>
    </div>
  );
};
