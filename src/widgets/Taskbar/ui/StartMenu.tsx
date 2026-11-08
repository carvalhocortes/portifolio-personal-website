import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProgramDefinition } from '../../../entities/Program/model/types';
import styles from './Taskbar.module.css';

interface StartMenuProps {
  id: string;
  programs: ProgramDefinition[];
  onOpenProgram: (program: ProgramDefinition) => void;
  onToggleLanguage: () => void;
  onClose: (returnFocus: boolean) => void;
  /** Elements whose clicks do not count as "outside" (the Start button). */
  ignoreRef: React.RefObject<HTMLElement | null>;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  id,
  programs,
  onOpenProgram,
  onToggleLanguage,
  onClose,
  ignoreRef,
}) => {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  const items = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]'
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
        <span>CC 84</span>
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
            <span>{t(program.titleKey)}</span>
          </button>
        ))}
        <div className={styles.separator} role="separator" />
        <button
          type="button"
          role="menuitem"
          className={styles.menuItem}
          onClick={() => {
            onToggleLanguage();
            onClose(true);
          }}
        >
          <span className={styles.menuGlyph} aria-hidden="true">
            {t('taskbar.languageCode')}
          </span>
          <span>{t('taskbar.languageItem')}</span>
        </button>
      </div>
    </div>
  );
};
