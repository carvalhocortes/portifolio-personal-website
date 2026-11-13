import { useEffect, useRef, useState } from 'react';
import styles from './Solitaire.module.css';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  /** Set for a radio item (checked or not); plain items leave it out. */
  checked?: boolean;
  /** A line above this item. */
  separator?: boolean;
}

export interface Menu {
  label: string;
  items: MenuItem[];
}

// The first letter underlined, like the 90s menus.
const Label = ({ text }: { text: string }) => (
  <>
    <u>{text[0]}</u>
    {text.slice(1)}
  </>
);

/**
 * A small working menu bar: a click opens a menu, the arrows move through the
 * items and to the next menu, Esc or a click outside closes it.
 */
export const MenuBar = ({ label, menus }: { label: string; menus: Menu[] }) => {
  const [open, setOpen] = useState<number | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const tops = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (open === null) return;
    // The first enabled item gets the focus, so the arrows work right away.
    bar.current
      ?.querySelector<HTMLButtonElement>('[role="menu"] button:not(:disabled)')
      ?.focus();
    const onPointerDown = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const close = (focusTop = true) => {
    if (focusTop && open !== null) tops.current[open]?.focus();
    setOpen(null);
  };

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const list = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>(
        'button:not(:disabled)'
      )
    );
    const at = list.indexOf(document.activeElement as HTMLButtonElement);
    const go = (i: number) => list[(i + list.length) % list.length]?.focus();
    const keys: Record<string, () => void> = {
      ArrowDown: () => go(at + 1),
      ArrowUp: () => go(at - 1),
      Home: () => go(0),
      End: () => go(list.length - 1),
      Escape: () => close(),
      ArrowRight: () => setOpen(((open ?? 0) + 1) % menus.length),
      ArrowLeft: () => setOpen(((open ?? 0) - 1 + menus.length) % menus.length),
      Tab: () => close(false),
    };
    const action = keys[e.key];
    if (!action) return;
    if (e.key !== 'Tab') e.preventDefault();
    action();
  };

  return (
    <div className={styles.menuBar} role="menubar" aria-label={label} ref={bar}>
      {menus.map((menu, m) => (
        <div key={menu.label} className={styles.menuSlot}>
          <button
            ref={(el) => {
              tops.current[m] = el;
            }}
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={open === m}
            className={styles.menuTop}
            onClick={() => setOpen(open === m ? null : m)}
            onPointerEnter={() => open !== null && open !== m && setOpen(m)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setOpen(m);
              }
            }}
          >
            <Label text={menu.label} />
          </button>
          {open === m && (
            <div
              className={styles.menuList}
              role="menu"
              aria-label={menu.label}
              onKeyDown={onMenuKeyDown}
            >
              {menu.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role={
                    item.checked === undefined ? 'menuitem' : 'menuitemradio'
                  }
                  aria-checked={item.checked}
                  disabled={item.disabled}
                  className={`${styles.menuItem} ${item.separator ? styles.separator : ''}`}
                  onClick={() => {
                    close();
                    item.onSelect();
                  }}
                >
                  <span className={styles.check} aria-hidden="true">
                    {item.checked ? '•' : ''}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
