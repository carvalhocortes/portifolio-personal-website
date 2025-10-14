import React, { useEffect, useRef } from "react";
import { CommandHistory } from "../../../features/CommandHistory/ui/CommandHistory";
import { CommandInput } from "../../../features/CommandInput/ui/CommandInput";
import { useTerminal } from "../model/useTerminal";
import "./Terminal.css";

export const Terminal = () => {
  const { commands, handleCommand } = useTerminal();
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const focusInput = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== "INPUT") {
      const input = e.currentTarget.querySelector("input");
      if (input) {
        input.focus();
      }
    }
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [commands]);

  return (
    <div className="terminal-widget" onClick={focusInput}>
      <CommandHistory commands={commands} />
      <CommandInput onEnter={handleCommand} />
      <div ref={terminalEndRef} />
    </div>
  );
};
