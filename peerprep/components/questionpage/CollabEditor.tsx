import React, { useState } from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-terminal";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/ext-inline_autocomplete";
import "ace-builds/src-noconflict/keybinding-vim";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-min-noconflict/ext-language_tools";
import PeerprepDropdown from "@/components/shared/PeerprepDropdown";

import { Question } from "@/api/structs";

const languages = [
  "javascript",
  "java",
  "python",
  "mysql",
  "golang",
  "typescript",
];

const themes = [
  "monokai",
  "github",
  "tomorrow",
  "kuroir",
  "twilight",
  "xcode",
  "textmate",
  "solarized_dark",
  "solarized_light",
  "terminal",
];

languages.forEach((lang) => {
  require(`ace-builds/src-noconflict/mode-${lang}`);
  require(`ace-builds/src-noconflict/snippets/${lang}`);
});

themes.forEach((theme) => require(`ace-builds/src-noconflict/theme-${theme}`));

interface Props {
  question: Question;
}

export default function CollabEditor({ question }: Props) {
  const [theme, setTheme] = useState("terminal");
  const [fontSize, setFontSize] = useState(18);
  const [language, setLanguage] = useState("python");

  const handleOnChange = (newValue: string) => {
    console.log("Content changed:", newValue);
  };

  const handleOnLoad = (editor: any) => {
    editor.container.style.resize = "both";
  };

  // TODO: to be taken from question props instead
  // const value = question[language] ?? "// Comment"
  const value = `def foo: 
  pass`;

  return (
    <>
      <div className="flex space-x-4 items-center p-4 m-4">
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Font Size</label>
          <input
            type="number"
            className="border border-gray-600 bg-gray-800 text-white p-2 rounded w-20"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </div>

        <PeerprepDropdown
          label={"Theme"}
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          options={themes}
          className={
            "border border-gray-600 bg-gray-800 text-white p-2 rounded"
          }
        />

        <PeerprepDropdown
          label={"Language"}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          options={languages}
          className={
            "border border-gray-600 bg-gray-800 text-white p-2 rounded"
          }
        />
      </div>

      <AceEditor
        mode={language}
        className={"editor"}
        width={"90%"}
        height={"90%"}
        theme={theme}
        name="Editor"
        fontSize={fontSize}
        onLoad={handleOnLoad}
        onChange={handleOnChange}
        lineHeight={19}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        value={value}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 4,
        }}
      />
    </>
  );
}
