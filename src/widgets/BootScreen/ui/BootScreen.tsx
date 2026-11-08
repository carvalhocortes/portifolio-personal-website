import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { content, resource } from '../../../entities/Content';
import { StartLogo } from '../../../shared/ui/icons';
import { FunScreen } from '../../FunScreens';
import styles from './BootScreen.module.css';

// How long each screen stays, in ms. About 3.8 s in all.
export const BIOS_MS = 1100;
export const DOS_MS = 1200;
export const SPLASH_MS = 1500;
/** With reduced motion: only the logo screen, still. */
export const REDUCED_MS = 1000;

const TICK_MS = 50;
/** Longest wait for the DOS font before the boot starts anyway. */
const FONT_WAIT_MS = 500;
const FONT = '20px "Px437 IBM VGA 8x16"';
const LINE_MS = 110;
const MEMORY_MS = 600;
const MEMORY_KB = 16384;
const TYPE_MS = 120;
const COMMAND = 'win';
const BIOS_HEADER = 'CC BIOS v1.984  (C) 1984-2026 Côrtes Systems';

/** The logo screen picture, from content/site.yaml. */
const SPLASH_IMAGE = resource(content.abertura.imagem.arquivo);

type Phase = 'bios' | 'dos' | 'splash';

const lines = (text: string) => text.replace(/\n$/, '').split('\n');

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

interface BootScreenProps {
  /** Called once, when the boot ends or is skipped. */
  onFinish: () => void;
}

/**
 * The desktop "turns on" like a 90s PC: a BIOS screen, a few DOS lines ending
 * in `C:\> win`, then a logo screen. A click, tap or key skips it. It is pure
 * decoration, so screen readers skip it too.
 */
export const BootScreen = ({ onFinish }: BootScreenProps) => {
  const { t } = useTranslation();
  const [reduced] = useState(prefersReducedMotion);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  useEffect(() => {
    elapsedRef.current = elapsed;
  });
  // Wait (briefly) for the DOS font, so the BIOS doesn't flash in another one.
  const [fontReady, setFontReady] = useState(() => !document.fonts);
  const finished = useRef(false);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const total = reduced ? REDUCED_MS : BIOS_MS + DOS_MS + SPLASH_MS;

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onFinishRef.current();
  }, []);

  // One clock drives every screen. It reads the real time instead of counting
  // ticks, because background tabs slow timers down to one tick a second.
  useEffect(() => {
    if (fontReady) return;
    const timer = window.setTimeout(() => setFontReady(true), FONT_WAIT_MS);
    document.fonts
      .load(FONT)
      .catch(() => undefined)
      .then(() => setFontReady(true));
    return () => window.clearTimeout(timer);
  }, [fontReady]);

  // DEL during the BIOS opens a fake setup screen; the boot waits behind it.
  const [setup, setSetup] = useState(false);

  useEffect(() => {
    if (!fontReady || setup) return;
    const start = Date.now() - elapsedRef.current;
    const id = window.setInterval(
      () => setElapsed(Date.now() - start),
      TICK_MS
    );
    return () => window.clearInterval(id);
    // elapsedRef keeps the time already shown when the clock restarts.
  }, [fontReady, setup]);

  useEffect(() => {
    if (!setup && elapsed >= total) finish();
  }, [elapsed, total, finish, setup]);

  // Fetch the logo picture during the BIOS, so it's ready when its turn comes.
  useEffect(() => {
    new Image().src = SPLASH_IMAGE;
  }, []);

  const phase: Phase = reduced
    ? 'splash'
    : elapsed < BIOS_MS
      ? 'bios'
      : elapsed < BIOS_MS + DOS_MS
        ? 'dos'
        : 'splash';
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  });

  // Any key skips, except DEL during the BIOS, which opens the setup. While
  // the setup is open, it handles the keys itself (Esc leaves).
  useEffect(() => {
    if (setup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && phaseRef.current === 'bios') {
        e.preventDefault();
        setSetup(true);
        return;
      }
      finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish, setup]);

  return (
    <>
      <div
        className={styles.boot}
        aria-hidden="true"
        data-testid="boot-screen"
        data-phase={phase}
        onClick={finish}
      >
        {fontReady && phase === 'bios' && <BiosScreen elapsed={elapsed} />}
        {phase === 'dos' && (
          <DosScreen elapsed={elapsed - BIOS_MS} text={t('abertura.dos')} />
        )}
        {phase === 'splash' && <Splash still={reduced} />}
        {fontReady && phase !== 'splash' && (
          <p className={styles.skip}>{t('boot.skip')}</p>
        )}
      </div>
      {setup && <FunScreen variant="setup" onExit={finish} />}
    </>
  );
};

const BiosScreen = ({ elapsed }: { elapsed: number }) => {
  const { t } = useTranslation();
  // The memory counts up in 1 MB steps, like the old memory test.
  const kb = Math.min(
    MEMORY_KB,
    Math.floor((elapsed / MEMORY_MS) * (MEMORY_KB / 1024)) * 1024
  );
  const text = t('abertura.bios', { memoria: `${kb}K` });
  const shown = lines(text).slice(0, Math.floor(elapsed / LINE_MS) + 1);
  return (
    <div className={styles.text}>
      <div className={styles.biosLogo}>
        <StartLogo size={96} />
      </div>
      <p className={styles.bright}>{BIOS_HEADER}</p>
      <p>&nbsp;</p>
      {shown.map((line, i) => (
        <p key={i}>{line || '\u00a0'}</p>
      ))}
    </div>
  );
};

const DosScreen = ({ elapsed, text }: { elapsed: number; text: string }) => {
  const all = lines(text);
  const linesDone = all.length * LINE_MS;
  const shown = all.slice(0, Math.floor(elapsed / LINE_MS) + 1);
  const typed = Math.max(
    0,
    Math.min(COMMAND.length, Math.floor((elapsed - linesDone) / TYPE_MS))
  );
  return (
    <div className={styles.text}>
      {shown.map((line, i) => (
        <p key={i}>{line || '\u00a0'}</p>
      ))}
      {elapsed >= linesDone && (
        <>
          <p>&nbsp;</p>
          <p>
            C:\&gt; {COMMAND.slice(0, typed)}
            <span className={styles.cursor}>_</span>
          </p>
        </>
      )}
    </div>
  );
};

// The logo picture covers the screen; it has sky to spare on every side, so
// any screen shape crops only clouds.
const Splash = ({ still }: { still: boolean }) => (
  <div className={styles.splash}>
    <img className={styles.splashImage} src={SPLASH_IMAGE} alt="" />
    <div className={`${styles.band} ${still ? styles.still : ''}`} />
  </div>
);
