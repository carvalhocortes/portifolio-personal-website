import React, { memo } from 'react';
import { DOS_PROMPT } from '../../config/constants';
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
        translate="no"
      >
        {DOS_PROMPT}
      </span>
    );
  }
);

Prompt.displayName = 'Prompt';
