import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

import { FormatResponse, Language, Question } from "@/api/structs";
import PeerprepButton from "../shared/PeerprepButton";
import CommsPanel from "./CommsPanel";

import { diff_match_patch } from "diff-match-patch";
import { callFormatter } from "@/app/api/internal/formatter/helper";

const languages: Language[] = ["javascript", "python", "c_cpp"];

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
  roomID?: string;
  authToken?: string;
  userId?: string | undefined;
  matchHash?: string;
}

interface Message {
  type: "content_change" | "auth" | "close_session";
  data?: string;
  userId?: string | undefined;
  token?: string;
  matchHash?: string;
}

const dmp = new diff_match_patch();
const questionSeed = "def foo():\n  pass";

export default function CollabEditor({
  question,
  roomID,
  authToken,
  userId,
  matchHash,
}: Props) {
  const [theme, setTheme] = useState("terminal");
  const [fontSize, setFontSize] = useState(18);
  const [language, setLanguage] = useState<Language>("python");
  const [value, setValue] = useState(questionSeed);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const router = useRouter();

  const generatePatch = (oldContent: string, newContent: string): string => {
    const diffs = dmp.diff_main(oldContent, newContent);
    const patches = dmp.patch_make(oldContent, diffs);

    // return patches;
    return dmp.patch_toText(patches);
  };

  const applyPatches = (text: string, patchText: any): string => {
    const patches = dmp.patch_fromText(patchText);
    console.log(patches);
    const [newText, _results] = dmp.patch_apply(patches, text);
    return newText;
  };

  async function formatCode(value: string, language: Language) {
    try {
      const res = await callFormatter(value, language);
      const formatResponse = res as FormatResponse;
      const formatted_code = formatResponse.formatted_code;

      setValue(formatted_code);
      if (
        socket &&
        formatted_code !== value &&
        socket?.readyState === WebSocket.OPEN
      ) {
        const patches = generatePatch(value, formatted_code);
        const msg: Message = {
          type: "content_change",
          data: patches,
          userId: userId,
        };
        socket.send(JSON.stringify(msg));
      }
    } catch (e: any) {
      alert(e.message);
    }
  }

  const handleOnChange = (newValue: string) => {
    const patches = generatePatch(value, newValue);

    setValue(newValue);
    console.log("Content changed:", userId, newValue);

    if (socket) {
      const msg: Message = {
        type: "content_change",
        data: patches,
        userId: userId,
      };
      socket.send(JSON.stringify(msg));
    }
  };

  const handleOnLoad = (editor: any) => {
    editor.container.style.resize = "both";
  };

  useEffect(() => {
    if (!roomID) return;

    console.log("Testing http");

    const newSocket = new WebSocket(`/api/proxy?roomID=${roomID}`);

    newSocket.onopen = () => {
      console.log("WebSocket connection established");
      setConnected(true);

      const authMessage: Message = {
        type: "auth",
        token: authToken,
        matchHash: matchHash, // omitted if undefined
      };
      newSocket.send(JSON.stringify(authMessage));
    };

    newSocket.onmessage = (event) => {
      if (event.data == "Authentication failed") {
        window.alert("Authentication failed");
        if (socket) {
          socket.close();
        }
        router.push("/questions");
      } else if (event.data == "The session has been closed by a user.") {
        window.alert("Session has ended");
        if (socket) {
          socket.close();
        }
        router.push("/questions");
      } else {
        const message: Message = JSON.parse(event.data);

        if (message.type === "content_change" && message.userId !== userId) {
          console.log(
            "Received message from user: ",
            message.userId,
            "I am",
            userId,
            "We are the same: ",
            message.userId === userId,
          );
          setValue((currentValue) => {
            return applyPatches(currentValue, message.data);
          });
        }
      }
    };

    newSocket.onerror = (event) => {
      console.error("WebSocket error observed:", event);
      console.error("WebSocket readyState:", newSocket.readyState);
      console.error("WebSocket URL:", newSocket.url);
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
      //   router.push("/questions");
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleCloseConnection = () => {
    const confirmClose = confirm(
      "Are you sure you are finished? This will close the room for all users.",
    );

    if (confirmClose && socket) {
      console.log("Sent!");
      const msg: Message = {
        type: "close_session",
        userId: userId,
      };
      socket.send(JSON.stringify(msg));
    }
  };

  return (
    <>
      <CommsPanel className="flex flex-row justify-around" roomId={roomID} />
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
          label={"Syntax Highlighting"}
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          options={languages}
          className={
            "border border-gray-600 bg-gray-800 text-white p-2 rounded"
          }
        />

        <PeerprepButton onClick={() => formatCode(value, language)}>
          Format code
        </PeerprepButton>

        {roomID &&
          (connected ? (
            <div className="h-full align-middle">
              <PeerprepButton onClick={handleCloseConnection}>
                Close Room
              </PeerprepButton>
            </div>
          ) : (
            <div className="h-full align-middle">
              <PeerprepButton
                onClick={handleCloseConnection}
                className="disabled"
              >
                Disconnected. Check logs.
              </PeerprepButton>
            </div>
          ))}
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
