import React, { useState, type KeyboardEvent } from 'react';
import { Input } from '../../../shared/ui/Input/Input';
import './CommandInput.css';

interface CommandInputProps {
  onEnter: (command: string) => void;
}

export const CommandInput: React.FC<CommandInputProps> = ({ onEnter }) => {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() !== '') {
      onEnter(value);
      setValue('');
    }
  };

  return (
    <div className="command-input-container">
      <span className="prompt">❯</span>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    </div>
  );
};
