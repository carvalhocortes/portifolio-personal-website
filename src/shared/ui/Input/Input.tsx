import React, { memo, type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

export const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = memo(
  (props) => {
    return <input className={styles.input} {...props} />;
  }
);

Input.displayName = 'Input';
