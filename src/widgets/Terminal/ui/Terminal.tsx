import React, { useEffect, useRef } from "react";
import { CommandHistory } from "../../../features/CommandHistory/ui/CommandHistory";
import { CommandInput } from "../../../features/CommandInput/ui/CommandInput";
import { useTerminal } from "../model/useTerminal";
import "./Terminal.css";

export const Terminal = () => {
  const { commands, handleCommand } = useTerminal();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const lastCommandRef = useRef<HTMLDivElement | null>(null);

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
    if (commands.length === 0) return;

    requestAnimationFrame(() => {
      if (lastCommandRef.current) {
        const commandElement = lastCommandRef.current;
        const terminalWidget = commandElement.closest(".terminal-widget");

        if (terminalWidget) {
          const commandHeight = commandElement.offsetHeight;
          const viewportHeight = terminalWidget.clientHeight;

          if (commandHeight > viewportHeight) {
            commandElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          } else {
            terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    });
  }, [commands]);

  return (
    <div className="terminal-widget" onClick={focusInput}>
      <CommandHistory commands={commands} lastCommandRef={lastCommandRef} />
      <CommandInput onEnter={handleCommand} />
      <div ref={terminalEndRef} />
    </div>
  );
};
