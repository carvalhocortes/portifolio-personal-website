import React from 'react';
import type { Command } from '../../../entities/Command/model/types';
import { MarkdownRenderer } from '../../../shared/ui/MarkdownRenderer';
import { Prompt } from '../../../shared/ui/Prompt';
import styles from './CommandHistory.module.css';

interface CommandHistoryProps {
  commands: Command[];
  lastCommandRef?: React.RefObject<HTMLDivElement | null>;
}

export const CommandHistory: React.FC<CommandHistoryProps> = ({
  commands,
  lastCommandRef,
}) => {
  return (
    <div className={styles.commandHistory} role="log" aria-live="polite">
      {commands.map((cmd, index) => (
        <article
          key={cmd.id}
          className={styles.commandItem}
          ref={index === commands.length - 1 ? lastCommandRef : null}
          aria-label={`Command: ${cmd.text}`}
        >
          <div className={styles.promptHistory}>
            <Prompt variant="history" />
            <span className={styles.commandText}>{cmd.text}</span>
          </div>
          <div
            className={styles.output}
            role="region"
            aria-label="Command output"
          >
            <MarkdownRenderer>{cmd.output}</MarkdownRenderer>
          </div>
        </article>
      ))}
    </div>
  );
};
