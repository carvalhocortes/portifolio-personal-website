import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProgramDefinition } from '../../../entities/Program/model/types';
import { useProgramTitles } from '../../../entities/Program/model/useProgramTitles';
import styles from './Taskbar.module.css';

const LANGUAGES = ['pt-BR', 'en-US'] as const;
export type Language = (typeof LANGUAGES)[number];

// Each language named in itself, so anyone finds theirs.
const LANGUAGE_NAMES: Record<Language, string> = {
  'pt-BR': 'Português',
  'en-US': 'English',
};

interface StartMenuProps {
  id: string;
  programs: ProgramDefinition[];
  onOpenProgram: (program: ProgramDefinition) => void;
  /** Current i18next language: 'pt-BR' or 'en-US'. */
  language: string;
  onSetLanguage: (language: Language) => void;
  onClose: (returnFocus: boolean) => void;
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
  ignoreRef,
}) => {
  const { t } = useTranslation();
  const { nameOf } = useProgramTitles();
  const menuRef = useRef<HTMLDivElement>(null);

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
          {LANGUAGES.map((code) => {
            const current = language === code;
            return (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                aria-checked={current}
                aria-label={`${LANGUAGE_NAMES[code]} (${code})`}
                lang={code}
                className={`${styles.button} ${styles.languageButton} ${current ? styles.pressed : ''}`}
                onClick={() => onSetLanguage(code)}
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
