import React, {
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type SyntheticEvent,
} from 'react';
import { isEmptyOrWhitespace } from '../../../shared/lib/terminalUtils';
import { Prompt } from '../../../shared/ui/Prompt';
import styles from './CommandInput.module.css';

interface CommandInputProps {
  onEnter: (command: string) => void;
  /** Commands available to ArrowUp/ArrowDown, oldest first. */
  history: string[];
}

// A command is a single line: pasted line breaks become spaces.
const toSingleLine = (text: string) => text.replace(/\r?\n/g, ' ');

export const CommandInput: React.FC<CommandInputProps> = ({
  onEnter,
  history,
}) => {
  const [value, setValue] = useState('');
  const [caret, setCaret] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const updateValue = (nextValue: string) => {
    setValue(nextValue);
    setCaret(nextValue.length);
  };

  const syncCaret = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    setCaret(e.currentTarget.selectionStart ?? e.currentTarget.value.length);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(toSingleLine(e.target.value));
    setCaret(e.target.selectionStart ?? e.target.value.length);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      // Never insert a line break; Enter only runs the command.
      e.preventDefault();
      if (isEmptyOrWhitespace(value)) return;
      onEnter(value);
      setHistoryIndex(-1);
      updateValue('');
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
      updateValue(history[newIndex]);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      const newIndex = historyIndex + 1;

      if (newIndex >= history.length) {
        setHistoryIndex(-1);
        updateValue('');
      } else {
        setHistoryIndex(newIndex);
        updateValue(history[newIndex]);
      }
    }
  };

  const position = Math.min(caret, value.length);

  return (
    <div className={styles.container}>
      <Prompt variant="current" />
      <div className={styles.field}>
        {/* What is seen: the text plus the DOS cursor at the caret. */}
        <span className={styles.mirror} aria-hidden="true">
          {value.slice(0, position)}
          <span className={styles.cursor} data-testid="dos-cursor" />
          {value.slice(position)}
        </span>
        {/* What is typed into: a transparent textarea laid over the mirror.
            It wraps exactly like the mirror, so a click lands on the
            character shown under the pointer. */}
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={syncCaret}
          onSelect={syncCaret}
          onClick={syncCaret}
          rows={1}
          autoFocus
          name="command"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          className={styles.input}
          aria-label="Terminal command input"
        />
      </div>
    </div>
  );
};
