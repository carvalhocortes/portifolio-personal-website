import type { ReactNode } from 'react';
import { useReveal } from '../lib/useReveal';
import reveal from './Reveal.module.css';
import styles from './Section.module.css';

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

/** A landing section: anchor target, heading and a fade-in on scroll. */
export const Section = ({ id, title, children, className }: SectionProps) => {
  const ref = useReveal<HTMLDivElement>();
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className={className}>
      <div ref={ref} className={`${styles.inner} ${reveal.reveal}`}>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
};
