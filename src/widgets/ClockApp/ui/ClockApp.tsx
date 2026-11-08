import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProgramProps } from '../../../entities/Program/model/types';
import { handAngles, longDate } from '../lib/time';
import styles from './ClockApp.module.css';

export type ClockMode = 'analog' | 'digital';
const MODES: ClockMode[] = ['analog', 'digital'];
export const CLOCK_MODE_KEY = 'cc84.clockMode';

// The last mode the visitor picked; analog the first time. Storage can throw
// (blocked site data), so it falls back quietly.
const savedMode = (): ClockMode => {
  try {
    return localStorage.getItem(CLOCK_MODE_KEY) === 'digital'
      ? 'digital'
      : 'analog';
  } catch {
    return 'analog';
  }
};

const saveMode = (mode: ClockMode) => {
  try {
    localStorage.setItem(CLOCK_MODE_KEY, mode);
  } catch {
    // Nothing to do: the choice just isn't remembered.
  }
};

/**
 * Clock program: an analog face like the 90s desktop clock, or a digital
 * readout with the date, picked with two buttons at the bottom.
 */
export const ClockApp = (_props: ProgramProps) => {
  const { t, i18n } = useTranslation();
  const [now, setNow] = useState(() => new Date());
  const [mode, setMode] = useState<ClockMode>(savedMode);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const pick = (next: ClockMode) => {
    setMode(next);
    saveMode(next);
  };

  // Screen readers get the time to the minute, so it doesn't change every
  // second while someone reads it.
  const spoken = t('clock.now', {
    time: now.toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
    }),
  });

  return (
    <div className={styles.clock}>
      <div className={styles.face} role="img" aria-label={spoken}>
        {mode === 'analog' ? (
          <AnalogFace date={now} />
        ) : (
          <DigitalFace date={now} language={i18n.language} />
        )}
      </div>
      <div
        className={styles.modes}
        role="radiogroup"
        aria-label={t('clock.mode')}
      >
        {MODES.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={mode === option}
            className={styles.modeButton}
            onClick={() => pick(option)}
          >
            {t(`clock.${option}`)}
          </button>
        ))}
      </div>
    </div>
  );
};

const RADIUS = 86;

// A hand as a long kite, with a shadow and a light edge for the raised look.
const Hand = ({
  angle,
  length,
  width,
  name,
}: {
  angle: number;
  length: number;
  width: number;
  name: string;
}) => {
  const points = `0,${-length} ${width},6 0,12 ${-width},6`;
  return (
    <g
      transform={`rotate(${angle})`}
      data-hand={name}
      data-angle={angle.toFixed(1)}
    >
      <polygon points={points} transform="translate(2 2)" fill="#404040" />
      <polygon
        points={points}
        fill="#008080"
        stroke="#7fd4d4"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </g>
  );
};

const AnalogFace = ({ date }: { date: Date }) => {
  const { hour, minute, second } = handAngles(date);
  return (
    <svg
      viewBox="-100 -100 200 200"
      className={styles.analog}
      aria-hidden="true"
      focusable="false"
    >
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const x = Math.sin(a) * RADIUS;
        const y = -Math.cos(a) * RADIUS;
        // Hours: a raised teal square; minutes: a small dot.
        return i % 5 === 0 ? (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect x="-3" y="-3" width="7" height="7" fill="#404040" />
            <rect x="-4" y="-4" width="7" height="7" fill="#7fd4d4" />
            <rect x="-3" y="-3" width="6" height="6" fill="#008080" />
          </g>
        ) : (
          <circle key={i} cx={x} cy={y} r="1.1" fill="#404040" />
        );
      })}
      <Hand name="hour" angle={hour} length={48} width={8} />
      <Hand name="minute" angle={minute} length={74} width={7} />
      <g
        transform={`rotate(${second})`}
        data-hand="second"
        data-angle={second.toFixed(1)}
      >
        <line
          x1="0"
          y1="14"
          x2="0"
          y2="-80"
          stroke="#202020"
          strokeWidth="0.8"
        />
      </g>
    </svg>
  );
};

const DigitalFace = ({ date, language }: { date: Date; language: string }) => (
  <div className={styles.digital} aria-hidden="true">
    <span className={styles.time}>
      {date.toLocaleTimeString(language, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}
    </span>
    <span className={styles.date}>{longDate(date, language)}</span>
  </div>
);
