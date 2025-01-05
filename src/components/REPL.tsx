"use client";

import { engine, isErr, strof } from "@/algebron/main";
import { forwardRef, ReactNode, useEffect, useRef, useState } from "react";

type Children = { children: ReactNode };

const Container = ({ children }: Children) => {
  return <div className="repl">{children}</div>;
};

const InputCarat = ({
  children,
  color = "grey",
}: Children & { color?: string }) => {
  return (
    <div
      style={{
        color,
        paddingRight: "8px",
      }}
    >
      {children}
    </div>
  );
};

const InputLine = ({ children }: Children) => {
  return <div style={{ display: "flex", marginTop: "8px" }}>{children}</div>;
};

const ActiveInputLine = ({ children }: Children) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginTop: "10px",
        marginLeft: "8px",
        marginBottom: "5px",
      }}
    >
      {children}
    </div>
  );
};

const Output = ({ children }: Children) => {
  return (
    <div
      style={{
        color: "var(--foreground)",
        marginTop: "8px",
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
    </div>
  );
};

const Error = ({ children }: Children) => {
  return (
    <div
      style={{
        color: "rgb(255 118 118)",
        marginTop: "8px",
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
    </div>
  );
};

type TerminalContentProps = Children & { height: number };

// eslint-disable-next-line react/display-name
const TerminalContent = forwardRef<HTMLDivElement, TerminalContentProps>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        style={{
          padding: "9px",
          paddingTop: "1px",
          height: `${props.height}px`,
          overflowY: "auto",
        }}
      >
        {props.children}
      </div>
    );
  }
);

type ReplLine = { type: "input" | "output" | "error"; value: string };
type ReplProps = {
  initialLines: ReplLine[];
  height: number;
};

let E = engine();

const REPL = ({ initialLines = [], height = 500 }: ReplProps) => {
  const [lines, setLines] = useState(initialLines);
  const execAndGetLine = (execline: string): ReplLine => {
    if (!execline.trim()) {
      return { type: "output", value: "nil" };
    }
    const evalOutput = E.compile(execline);
    if (isErr(evalOutput)) {
      return { type: "error", value: evalOutput.toString() };
    } else {
      return { type: "output", value: strof(evalOutput) };
    }
  };
  const onSubmit = (execline: string) => {
    if (execline === "clear") {
      setLines([]);
      E = engine();
      return;
    }
    const newlines = lines.concat([{ type: "input", value: execline }]);
    setLines(newlines);
    if (!execline.trim()) return;
    setLines(newlines.concat([execAndGetLine(execline)]));
  };
  const inputRef = useRef<HTMLInputElement | null>(null);
  const terminalContentRef = useRef<HTMLDivElement | null>(null);
  const [activeInputValue, setActiveInputValue] = useState("");
  const [historySelectIndex, setHistorySelectIndex] = useState(-1);
  useEffect(() => {
    if (!terminalContentRef.current) return;
    terminalContentRef.current.scrollTop =
      terminalContentRef.current.scrollHeight;
  }, [lines]);
  return (
    <Container>
      <TerminalContent height={height} ref={terminalContentRef}>
        {lines.map((line, i) =>
          line.type === "input" ? (
            <InputLine key={i}>
              <InputCarat>{"in:"}</InputCarat>
              {line.value}
            </InputLine>
          ) : line.type === "output" ? (
            <Output key={i}>
              <span style={{ color: "grey" }}>out:</span> {line.value}
            </Output>
          ) : (
            <Error key={i}>{line.value.toString()}</Error>
          )
        )}
      </TerminalContent>
      <ActiveInputLine>
        <InputCarat color="var(--foreground)">{"$:"}</InputCarat>
        <input
          style={{
            color: "var(--foreground)",
            fontSize: "inherit",
            fontWeight: "bold",
            border: "none",
            outline: "none",
            flexGrow: "1",
            caretColor: "var(--foreground)",
            backgroundColor: "transparent",
            fontFamily: "monospace",
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              onSubmit(activeInputValue);
              setActiveInputValue("");
            } else if (e.key === "ArrowUp") {
              const newHSI = historySelectIndex + 1;
              const inputs = lines.filter((l) => l.type === "input");
              inputs.reverse();
              if (newHSI < inputs.length) {
                setActiveInputValue(inputs[newHSI].value);
                setHistorySelectIndex(newHSI);
              }
            } else if (e.key === "ArrowDown") {
              const newHSI = historySelectIndex - 1;
              const inputs = lines.filter((l) => l.type === "input");
              inputs.reverse();
              if (newHSI >= 0) {
                setActiveInputValue(inputs[newHSI].value);
                setHistorySelectIndex(newHSI);
              }
            }
          }}
          onChange={(e) => setActiveInputValue(e.target.value)}
          value={activeInputValue}
          ref={inputRef}
        />
      </ActiveInputLine>
    </Container>
  );
};

export default REPL;
