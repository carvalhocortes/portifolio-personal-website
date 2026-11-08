import { ArrowClockwise, ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProgramProps } from '../../../entities/Program/model/types';
import styles from './Browser.module.css';

// The landing page (and its photos and font) loads only when the browser opens.
const LandingContent = lazy(() =>
  import('../../Landing/ui/LandingContent').then((m) => ({
    default: m.LandingContent,
  }))
);

const NAV_BUTTONS = [
  { key: 'browser.back', Icon: ArrowLeft },
  { key: 'browser.forward', Icon: ArrowRight },
  { key: 'browser.reload', Icon: ArrowClockwise },
] as const;

/** A browser-looking window that shows the landing page. */
export const Browser = ({ isActive }: ProgramProps) => {
  const { t } = useTranslation();
  // The browser starts minimized: load the page the first time it shows up.
  const [shown, setShown] = useState(isActive);
  useEffect(() => {
    if (isActive) setShown(true);
  }, [isActive]);

  return (
    <div className={styles.browser}>
      <div className={styles.toolbar}>
        {NAV_BUTTONS.map(({ key, Icon }) => (
          <button
            key={key}
            type="button"
            className={styles.navButton}
            aria-label={t(key)}
            disabled
          >
            <Icon size={14} weight="bold" aria-hidden="true" />
          </button>
        ))}
        <input
          className={styles.address}
          aria-label={t('browser.address')}
          value={t('landing.pageTitle')}
          readOnly
        />
      </div>
      <div className={styles.viewport}>
        {shown && (
          <Suspense fallback={<div className={styles.page} aria-busy="true" />}>
            <LandingContent embedded />
          </Suspense>
        )}
      </div>
    </div>
  );
};
