import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProgramDefinition } from '../../../entities/Program/model/types';
import { useProgramTitles } from '../../../entities/Program/model/useProgramTitles';
import {
  MUSSUM,
  revealMussum,
  useMussumRevealed,
} from '../../../shared/i18n/mussumMode';
import { PowerIcon, RestartIcon } from '../../../shared/ui/icons';
import styles from './Taskbar.module.css';

// pt-MUSSUM (an easter egg) shows only once revealed.
const LANGUAGES = ['pt-BR', 'en-US', MUSSUM] as const;
export type Language = (typeof LANGUAGES)[number];

// Each language named in itself, so anyone finds theirs.
const LANGUAGE_NAMES: Record<Exclude<Language, typeof MUSSUM>, string> = {
  'pt-BR': 'Português',
  'en-US': 'English',
};

/** Quick clicks on pt-BR that reveal the pt-MUSSUM button. */
export const REVEAL_CLICKS = 3;
export const REVEAL_WINDOW_MS = 2000;

interface StartMenuProps {
  id: string;
  programs: ProgramDefinition[];
  onOpenProgram: (program: ProgramDefinition) => void;
  /** Current i18next language: 'pt-BR', 'en-US' or 'pt-MUSSUM'. */
  language: string;
  onSetLanguage: (language: Language) => void;
  onClose: (returnFocus: boolean) => void;
  onRestart?: () => void;
  onShutdown?: () => void;
  /** The "Plus!" easter egg on the banner. */
  plus?: boolean;
  /** Elements whose clicks do not count as "outside" (the Start button). */
  ignoreRef: React.RefObject<HTMLElement | null>;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  id,
  programs,
  onOpenProgram,
  language,
  onSetLanguage,
  onClose,
  onRestart,
  onShutdown,
  plus = false,
  ignoreRef,
}) => {
  const { t } = useTranslation();
  const { nameOf } = useProgramTitles();
  const menuRef = useRef<HTMLDivElement>(null);
  const mussumRevealed = useMussumRevealed();
  const ptClicks = useRef<number[]>([]);
  const countPtClick = () => {
    const now = Date.now();
    ptClicks.current = [
      ...ptClicks.current.filter((at) => now - at < REVEAL_WINDOW_MS),
      now,
    ];
    if (ptClicks.current.length >= REVEAL_CLICKS) revealMussum();
  };

  const items = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"], [role="menuitemradio"]'
      ) ?? []
    );

  useEffect(() => {
    items()[0]?.focus();

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !ignoreRef.current?.contains(target)
      ) {
        onClose(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [onClose, ignoreRef]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose(true);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      list[(index + 1) % list.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      list[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      list[list.length - 1]?.focus();
    } else if (e.key === 'Tab') {
      onClose(false);
    }
  };

  return (
    <div
      ref={menuRef}
      id={id}
      className={styles.startMenu}
      role="menu"
      aria-label={t('taskbar.startMenu')}
      onKeyDown={onKeyDown}
    >
      <div className={styles.banner} aria-hidden="true">
        <span>
          <b>CarvalhoCortes</b> 84
          {plus && <i className={styles.plus}> {t('secrets.plus')}</i>}
        </span>
      </div>
      <div className={styles.menuItems}>
        {programs.map((program) => (
          <button
            key={program.id}
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={() => {
              onOpenProgram(program);
              onClose(false);
            }}
          >
            <program.Icon size={32} />
            <span>{nameOf(program)}</span>
          </button>
        ))}
        <div className={styles.separator} role="separator" />
        {/* Two buttons, like a radio group: the current language stays pressed.
            The menu stays open, so the change shows right away. */}
        <div
          className={styles.languageRow}
          role="group"
          aria-label={t('taskbar.language')}
        >
          {LANGUAGES.filter((code) => code !== MUSSUM || mussumRevealed).map(
            (code) => {
              const current = language === code;
              const name =
                code === MUSSUM
                  ? t('secrets.mussum.language')
                  : LANGUAGE_NAMES[code];
              return (
                <button
                  key={code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={current}
                  aria-label={`${name} (${code})`}
                  lang={code === MUSSUM ? 'pt-BR' : code}
                  className={`${styles.button} ${styles.languageButton} ${current ? styles.pressed : ''}`}
                  onClick={() => {
                    if (code === 'pt-BR') countPtClick();
                    onSetLanguage(code);
                  }}
                >
                  {code}
                </button>
              );
            }
          )}
        </div>
        {(onRestart || onShutdown) && (
          <div className={styles.separator} role="separator" />
        )}
        {onRestart && (
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={() => {
              onClose(false);
              onRestart();
            }}
          >
            <span className={styles.menuIcon}>
              <RestartIcon size={21} />
            </span>
            <span>{t('secrets.shutdown.restart')}</span>
          </button>
        )}
        {onShutdown && (
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={() => {
              onClose(false);
              onShutdown();
            }}
          >
            <span className={styles.menuIcon}>
              <PowerIcon size={23} />
            </span>
            <span>{t('secrets.shutdown.menu')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
