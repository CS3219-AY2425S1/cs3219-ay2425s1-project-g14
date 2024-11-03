import React, { useState, useEffect } from "react";
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

import { Question } from "@/api/structs";
import PeerprepButton from "../shared/PeerprepButton";
import CommsPanel from "./CommsPanel";

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
  roomID?: String;
  authToken?: String;
  matchHash?: String;
}

export default function CollabEditor({
  question,
  roomID,
  authToken,
  matchHash,
}: Props) {
  const [theme, setTheme] = useState("terminal");
  const [fontSize, setFontSize] = useState(18);
  const [language, setLanguage] = useState("python");
  const [value, setValue] = useState("def foo:\n  pass");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setconnected] = useState(false);
  const router = useRouter();

  const handleOnChange = (newValue: string) => {
    setValue(newValue);
    console.log("Content changed:", newValue);

    if (socket) {
      socket.send(JSON.stringify({ type: "content_change", data: newValue }));
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
      setconnected(true);

      const authMessage = {
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
        const message = JSON.parse(event.data);

        if (message.type === "content_change") {
          setValue(message.data);
        }
      }
    };

    newSocket.onerror = (e) => {
      console.log("server down");
      console.log(e);
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
      "Are you sure you are finished? This will close the room for all users."
    );

    if (confirmClose && socket) {
      console.log("Sent!");
      socket.send(JSON.stringify({ type: "close_session" }));
    }
  };

  return (
    <>
      <CommsPanel className="flex flex-row justify-around" roomId={roomID}/>
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
