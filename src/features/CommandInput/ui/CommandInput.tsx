import React, { useState, type KeyboardEvent } from 'react';
import { isEmptyOrWhitespace } from '../../../shared/lib/terminalUtils';
import { Input } from '../../../shared/ui/Input/Input';
import { Prompt } from '../../../shared/ui/Prompt';
import styles from './CommandInput.module.css';

interface CommandInputProps {
  onEnter: (command: string) => void;
}

export const CommandInput: React.FC<CommandInputProps> = ({ onEnter }) => {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isEmptyOrWhitespace(value)) {
      onEnter(value);
      setHistory((prev) => [...prev, value]);
      setHistoryIndex(-1);
      setValue('');
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;

      const newIndex =
        historyIndex === -1
          ? history.length - 1
          : Math.max(0, historyIndex - 1);

      setHistoryIndex(newIndex);
      setValue(history[newIndex]);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      const newIndex = historyIndex + 1;

      if (newIndex >= history.length) {
        setHistoryIndex(-1);
        setValue('');
      } else {
        setHistoryIndex(newIndex);
        setValue(history[newIndex]);
      }
    }
  };

  return (
    <div className={styles.container}>
      <Prompt variant="current" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        aria-label="Terminal command input"
      />
    </div>
  );
};
