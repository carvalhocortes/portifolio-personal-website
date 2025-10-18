import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Command } from "../../../entities/Command/model/types";
import "./CommandHistory.css";

interface CommandHistoryProps {
  commands: Command[];
  lastCommandRef?: React.RefObject<HTMLDivElement | null>;
}

export const CommandHistory: React.FC<CommandHistoryProps> = ({
  commands,
  lastCommandRef,
}) => {
  return (
    <div className="command-history">
      {commands.map((cmd, index) => (
        <div
          key={cmd.id}
          ref={index === commands.length - 1 ? lastCommandRef : null}
        >
          <div className="prompt-history">
            <span className="prompt">❯</span>
            <span>{cmd.text}</span>
          </div>
          <div className="output">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {cmd.output}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
};
