import { CaretLeft, CaretRight, X } from '@phosphor-icons/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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

/** Enlarged photo in a native modal <dialog>: arrows, Esc and focus trap. */
export const Lightbox = ({ photos, index, onChange }: LightboxProps) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = index !== null;

  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal?.();
    }
    if (!open) {
      if (dialog.open) dialog.close?.();
      // Back to the photo that opened the viewer.
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
    }
  }, [open]);

  if (index === null) {
    return <dialog ref={dialogRef} className={styles.dialog} />;
  }

  const photo = photos[index];
  const go = (step: number) =>
    onChange((index + step + photos.length) % photos.length);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={photo.caption}
      onClose={() => onChange(null)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
      onClick={(e) => {
        // A click on the backdrop (the dialog itself) closes it.
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
        autoFocus
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
    </dialog>
  );
};
