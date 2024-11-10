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

import { FormatResponse, Language } from "@/api/structs";
import PeerprepButton from "../shared/PeerprepButton";
import CommsPanel from "./CommsPanel";

// import { diff_match_patch } from "diff-match-patch";
import { callFormatter } from "@/app/api/internal/formatter/helper";
import { Ace } from "ace-builds";
import { connect } from "http2";

const PING_INTERVAL_MILLISECONDS = 15000;
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
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(`ace-builds/src-noconflict/mode-${lang}`);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(`ace-builds/src-noconflict/snippets/${lang}`);
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
themes.forEach((theme) => require(`ace-builds/src-noconflict/theme-${theme}`));

interface Props {
  roomID?: string;
  authToken?: string;
  userId?: string | undefined;
  matchHash?: string;
}

interface Message {
  type: string;
  roomId?: string;
  data?: string;
  userId?: string | undefined;
  token?: string;
  matchHash?: string;
}

enum MessageTypes {
  AUTH = "auth",
  AUTH_SUCCESS = "auth_success",
  AUTH_FAIL = "auth_fail",
  CLOSE_SESSION = "close_session",
  CONTENT_CHANGE = "content_change",
  PING = "ping",
}

// const dmp = new diff_match_patch();
// const questionSeed = "def foo():\n  pass";

export default function CollabEditor({
  roomID,
  authToken,
  userId,
  matchHash,
}: Props) {
  const [theme, setTheme] = useState("terminal");
  const [fontSize, setFontSize] = useState(18);
  const [language, setLanguage] = useState<Language>("python");
  const [value, setValue] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [otherUserConnected, setOtherUserConnected] = useState<boolean>(false);
  const [lastPingReceived, setLastPingReceived] = useState<number | null>(null);
  const router = useRouter();

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
        // const patches = generatePatch(value, formatted_code);
        const msg: Message = {
          type: MessageTypes.CONTENT_CHANGE.valueOf(),
          data: formatted_code,
          userId: userId,
        };
        socket.send(JSON.stringify(msg));
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  }

  const handleOnChange = (newValue: string) => {
    // const patches = generatePatch(value, newValue);

    setValue(newValue);
    console.log("Content changed:", userId, newValue);

    if (socket) {
      const msg: Message = {
        type: MessageTypes.CONTENT_CHANGE.valueOf(),
        data: newValue,
        userId: userId,
      };
      console.log("Sending message", msg);
      socket.send(JSON.stringify(msg));
    }
  };

  const handleOnLoad = (editor: Ace.Editor) => {
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
        type: MessageTypes.AUTH.valueOf(),
        token: authToken,
        matchHash: matchHash, // omitted if undefined
      };
      newSocket.send(JSON.stringify(authMessage));
    };

    newSocket.onmessage = (event) => {
      // console.log("Event is", event);
      console.error(event.data);

      const message: Message = JSON.parse(event.data);

      const msgType = message.type as MessageTypes;

      console.log("Received a message of type", msgType);
      console.log("Received a message", message.type);

      switch (msgType) {
        case MessageTypes.AUTH:
          // This should only be sent, never received by the client
          throw new Error("Received unexpected auth message");
        case MessageTypes.AUTH_SUCCESS:
          setAuthenticated(true);
          console.log("Auth success", message.data);
          setValue(message.data as string);
          break;
        case MessageTypes.AUTH_FAIL:
          window.alert("Authentication failed");
          newSocket.close();
          router.push("/questions");
          break;
        case MessageTypes.CLOSE_SESSION:
          window.alert(
            "Session has ended. If you leave the room now, this data will be lost.",
          );
          newSocket.close();
          setAuthenticated(false);
          setConnected(false);
          break;
        case MessageTypes.CONTENT_CHANGE:
          if (message.userId !== userId) {
            console.log(
              "Received message from user: ",
              message.userId,
              "I am",
              userId,
              "We are the same: ",
              message.userId === userId,
            );
            setValue(message.data as string);
          }
          break;
        case MessageTypes.PING:
          if (message.userId !== userId) {
            console.log("other user connected!");
            setOtherUserConnected(true);
            setLastPingReceived(Date.now());
          }
          break;
        default:
          const exhaustiveCheck: never = msgType;
          console.error("Unknown message type:", exhaustiveCheck);
          console.log("Message data:", message);
      }
    };

    newSocket.onerror = (event) => {
      console.error("WebSocket error observed:", event);
      console.error("WebSocket readyState:", newSocket.readyState);
      console.error("WebSocket URL:", newSocket.url);
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
      // TODO: should setConnected be false here?
      // setConnected(false);
      //   router.push("/questions");
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [authToken, matchHash, roomID, router, userId]);

  // ping ws
  const notifyRoomOfConnection = async () => {
    // send message over ws
    if (socket) {
      console.log("PINGING WS FROM " + userId);
      const msg: Message = {
        type: MessageTypes.PING.valueOf(),
        data: "pinging",
        userId: userId,
      };
      socket.send(JSON.stringify(msg));
    }
  };

  useEffect(() => {
    if (!connected || !socket) return;

    const interval = setInterval(
      notifyRoomOfConnection,
      PING_INTERVAL_MILLISECONDS,
    );

    const disconnectCheckInterval = setInterval(() => {
      if (
        lastPingReceived &&
        Date.now() - lastPingReceived > 2 * PING_INTERVAL_MILLISECONDS
      ) {
        setOtherUserConnected(false);
        clearInterval(disconnectCheckInterval);
      }
    }, PING_INTERVAL_MILLISECONDS);
    return () => {
      clearInterval(interval);
      clearInterval(disconnectCheckInterval);
    };
  }, [notifyRoomOfConnection, PING_INTERVAL_MILLISECONDS, connected, socket]);

  const handleCloseConnection = () => {
    const confirmClose = confirm(
      "Are you sure you are finished? This will close the room for all users.",
    );

    if (confirmClose && socket) {
      console.log("Sent!");
      const msg: Message = {
        type: MessageTypes.CLOSE_SESSION.valueOf(),
        userId: userId,
      };
      socket.send(JSON.stringify(msg));
    }
  };

  return (
    <>
      {authenticated && (
        <CommsPanel className="flex flex-row justify-around" roomId={roomID} />
      )}
      <div className="m-4 flex items-end space-x-4 p-4">
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Font Size</label>
          <input
            type="number"
            className="w-20 rounded border border-gray-600 bg-gray-800 p-2 text-white"
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
            "rounded border border-gray-600 bg-gray-800 p-2 text-white"
          }
        />

        <PeerprepDropdown
          label={"Syntax Highlighting"}
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          options={languages}
          className={
            "rounded border border-gray-600 bg-gray-800 p-2 text-white"
          }
        />

        <PeerprepButton onClick={() => formatCode(value, language)}>
          Format code
        </PeerprepButton>

        {roomID &&
          (connected ? (
            <div className="align-middle">
              <PeerprepButton onClick={handleCloseConnection}>
                Close Room
              </PeerprepButton>
            </div>
          ) : (
            <div className="align-middle">
              <PeerprepButton
                onClick={handleCloseConnection}
                className="disabled"
              >
                Disconnected. Check logs.
              </PeerprepButton>
            </div>
          ))}
      </div>
      {roomID &&
        (connected ? (
          <div className="flex items-center space-x-2 p-2">
            <span
              className={`h-4 w-4 rounded-full ${
                otherUserConnected ? "bg-difficulty-easy" : "bg-difficulty-hard"
              }`}
            ></span>
            <span>
              {otherUserConnected
                ? "Other user connected"
                : "Other user disconnected"}
            </span>
          </div>
        ) : (
          <div className="py-2">Disconnected. Check logs.</div>
        ))}
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
