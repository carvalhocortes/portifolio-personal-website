import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Command } from "../../../entities/Command/model/types";
import "./CommandHistory.css";

interface CommandHistoryProps {
  commands: Command[];
}

export const CommandHistory: React.FC<CommandHistoryProps> = ({ commands }) => {
  return (
    <div className="command-history">
      {commands.map((cmd) => (
        <div key={cmd.id}>
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
