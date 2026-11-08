import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './FunScreen.module.css';

export type FunScreenVariant = 'off' | 'bsod' | 'setup';

interface FunScreenProps {
  variant: FunScreenVariant;
  onExit: () => void;
  /** Leaves on its own after this long (the shutdown screen). */
  autoExitMs?: number;
}

/**
 * Full-screen joke screens over everything: "safe to turn off", the blue
 * screen and the fake BIOS setup. Any key or click leaves. Announced as a dialog and focused, so the keyboard
 * and screen readers land on it.
 */
export const FunScreen = ({ variant, onExit, autoExitMs }: FunScreenProps) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const exitRef = useRef(onExit);
  useEffect(() => {
    exitRef.current = onExit;
  });

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      exitRef.current();
    };
    window.addEventListener('keydown', onKey);
    const timer = autoExitMs
      ? window.setTimeout(() => exitRef.current(), autoExitMs)
      : undefined;
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(timer);
    };
  }, [variant, autoExitMs]);

  const label =
    variant === 'off'
      ? t('secrets.shutdown.safe')
      : variant === 'bsod'
        ? t('secrets.bsod.title')
        : t('secrets.setup.title');

  return (
    <div
      ref={ref}
      className={`${styles.screen} ${styles[variant]}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      data-testid={`fun-screen-${variant}`}
      onClick={() => exitRef.current()}
    >
      {variant === 'off' && <p className={styles.safe}>{label}</p>}
      {variant === 'bsod' && (
        <div className={styles.bsodBox}>
          <p className={styles.bsodTitle}>{label}</p>
          <p className={styles.pre}>{t('secrets.bsod.text')}</p>
        </div>
      )}
      {variant === 'setup' && (
        <div className={styles.setupBox}>
          <p className={styles.setupTitle}>{label}</p>
          <ul className={styles.setupList}>
            {(
              t('secrets.setup.options', { returnObjects: true }) as string[]
            ).map((option) => (
              <li key={option}>{option}</li>
            ))}
          </ul>
          <p className={styles.setupFooter}>{t('secrets.setup.footer')}</p>
        </div>
      )}
    </div>
  );
};
