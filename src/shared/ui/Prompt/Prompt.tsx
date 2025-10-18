import React, { memo } from 'react';
import styles from './Prompt.module.css';

export type PromptVariant = 'current' | 'history';

interface PromptProps {
  variant?: PromptVariant;
  className?: string;
}

export const Prompt: React.FC<PromptProps> = memo(
  ({ variant = 'current', className }) => {
    const variantClass =
      variant === 'current' ? styles.current : styles.history;
    const ariaLabel =
      variant === 'current' ? 'Command prompt' : 'Previous command';

    return (
      <span
        className={`${styles.prompt} ${variantClass} ${className || ''}`}
        aria-label={ariaLabel}
        role="img"
      >
        ❯
      </span>
    );
  }
);

Prompt.displayName = 'Prompt';
