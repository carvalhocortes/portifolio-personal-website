import { CaretLeft, CaretRight, X } from '@phosphor-icons/react';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLandingFrame } from '../lib/landingFrame';
import styles from './Lightbox.module.css';

export interface LightboxPhoto {
  src: string;
  caption: string;
}

interface LightboxProps {
  photos: LightboxPhoto[];
  /** Index of the open photo, or null when closed. */
  index: number | null;
  onChange: (index: number | null) => void;
}

/**
 * Enlarged photo over the landing frame: the whole screen as a page, only the
 * window inside Chrome. Arrows, Esc, focus kept inside, focus back on close.
 */
export const Lightbox = ({ photos, index, onChange }: LightboxProps) => {
  const { t } = useTranslation();
  const { overlayHost, contentRef } = useLandingFrame();
  const open = index !== null;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // The photo button that opened the viewer gets the focus back on close.
    const returnFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    // Behind the photo, the page can't be reached by keyboard or screen reader.
    const content = contentRef.current;
    content?.setAttribute('inert', '');
    return () => {
      content?.removeAttribute('inert');
      returnFocus?.focus();
    };
  }, [open, contentRef]);

  if (index === null) return null;

  const photo = photos[index];
  const go = (step: number) =>
    onChange((index + step + photos.length) % photos.length);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onChange(null);
    }
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'Tab') {
      // Keep Tab cycling through the viewer's buttons.
      const buttons = [
        ...e.currentTarget.querySelectorAll<HTMLButtonElement>('button'),
      ];
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        // A click on the backdrop (outside the photo and buttons) closes it.
        if (e.target === e.currentTarget) onChange(null);
      }}
    >
      <figure className={styles.figure}>
        <img src={photo.src} alt={photo.caption} />
        <figcaption className={styles.caption}>
          <span>{photo.caption}</span>
          <span className={styles.count}>
            {t('landing.photoCount', {
              current: index + 1,
              total: photos.length,
            })}
          </span>
        </figcaption>
      </figure>
      <button
        type="button"
        className={`${styles.button} ${styles.close}`}
        aria-label={t('landing.closePhoto')}
        onClick={() => onChange(null)}
        ref={closeRef}
      >
        <X size={20} weight="bold" />
      </button>
      {photos.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.button} ${styles.prev}`}
            aria-label={t('landing.previousPhoto')}
            onClick={() => go(-1)}
          >
            <CaretLeft size={22} weight="bold" />
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.next}`}
            aria-label={t('landing.nextPhoto')}
            onClick={() => go(1)}
          >
            <CaretRight size={22} weight="bold" />
          </button>
        </>
      )}
    </div>,
    overlayHost ?? document.body
  );
};
