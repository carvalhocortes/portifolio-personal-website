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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isEmptyOrWhitespace(value)) {
      onEnter(value);
      setValue('');
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
