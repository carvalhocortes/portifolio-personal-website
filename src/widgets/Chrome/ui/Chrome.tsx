import { ArrowClockwise, ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProgramProps } from '../../../entities/Program/model/types';
import styles from './Chrome.module.css';

// The landing page (and its photos and font) loads only when Chrome opens.
const LandingContent = lazy(() =>
  import('../../Landing/ui/LandingContent').then((m) => ({
    default: m.LandingContent,
  }))
);

const NAV_BUTTONS = [
  { key: 'chrome.back', Icon: ArrowLeft },
  { key: 'chrome.forward', Icon: ArrowRight },
  { key: 'chrome.reload', Icon: ArrowClockwise },
] as const;

/** A browser-looking window that shows the landing page. */
export const Chrome = ({ isActive }: ProgramProps) => {
  const { t } = useTranslation();
  // Chrome starts minimized: load the page the first time it shows up.
  const [shown, setShown] = useState(isActive);
  useEffect(() => {
    if (isActive) setShown(true);
  }, [isActive]);

  return (
    <div className={styles.chrome}>
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
          aria-label={t('chrome.address')}
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
