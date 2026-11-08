import { useRef, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { LandingFrameContext } from '../lib/landingFrame';
import { About } from './About';
import { Contact } from './Contact';
import { Footer } from './Footer';
import { Header } from './Header';
import { Hero } from './Hero';
import { Hobbies } from './Hobbies';
import { Volunteer } from './Volunteer';
import styles from './LandingContent.module.css';
import './landing.css';

interface LandingContentProps {
  /** Inside a desktop window: scrolls on its own and keeps overlays inside. */
  embedded?: boolean;
}

const HEADER_GAP = 16;

/** The landing page itself, used full screen (/landing, phones) and in the browser window. */
export const LandingContent = ({ embedded = false }: LandingContentProps) => {
  const { t } = useTranslation();
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // In a window, "#sobre" links scroll the window only (never the desktop)
  // and leave the address of the real page alone.
  const onAnchorClick = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      'a[href^="#"]'
    );
    const scroller = scrollRef.current;
    if (!link || !scroller) return;
    const id = link.getAttribute('href')!.slice(1);
    const target = id
      ? scroller.querySelector<HTMLElement>(`[id="${id}"]`)
      : null;
    if (!target) return;
    event.preventDefault();

    const header = scroller.querySelector('header')?.offsetHeight ?? 0;
    const top =
      target.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      header -
      HEADER_GAP;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    scroller.scrollTo?.({
      top: Math.max(0, top),
      behavior: reduce ? 'auto' : 'smooth',
    });
    if (target.tabIndex === -1) target.focus({ preventScroll: true });
  };

  return (
    <div
      ref={setFrame}
      className={`lp-root ${styles.frame}`}
      data-embedded={embedded || undefined}
    >
      <LandingFrameContext.Provider
        value={{ overlayHost: frame, contentRef, embedded }}
      >
        <div
          ref={scrollRef}
          className={styles.scroll}
          onClick={embedded ? onAnchorClick : undefined}
        >
          <div ref={contentRef} className={styles.content}>
            <a className={styles.skip} href="#conteudo">
              {t('landing.skipToContent')}
            </a>
            <Header />
            <main id="conteudo" tabIndex={-1} className={styles.main}>
              <Hero />
              <About />
              <Hobbies />
              <Volunteer />
              <Contact />
            </main>
            <Footer />
          </div>
        </div>
      </LandingFrameContext.Provider>
    </div>
  );
};
