import { ArrowRight, LinkedinLogo, Pause, Play } from '@phosphor-icons/react';
import { useState } from 'react';
import { content, resource } from '../../../entities/Content';
import { useContentLanguage } from '../lib/useContentLanguage';
import { SECTION_IDS } from './Header';
import styles from './Hero.module.css';

export const Hero = () => {
  const { t, text } = useContentLanguage();
  const { pessoa, contato, hobbies } = content;
  const photos = hobbies.itens.flatMap((hobby) => hobby.fotos);
  const [paused, setPaused] = useState(false);

  return (
    <section id="inicio" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.role}>{text(pessoa.titulo)}</p>
          <h1 id="hero-title" className={styles.title}>
            {pessoa.nome}
          </h1>
          <p className={styles.summary}>{text(pessoa.resumo)}</p>
          <div className={styles.actions}>
            <a className={styles.primary} href={`#${SECTION_IDS.contact}`}>
              {text(contato.menu)}
              <ArrowRight size={18} weight="bold" aria-hidden="true" />
            </a>
            <a
              className={styles.secondary}
              href={contato.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              <LinkedinLogo size={20} weight="fill" aria-hidden="true" />
              {t('landing.linkedin')}
            </a>
          </div>
        </div>

        <div className={styles.portrait}>
          <div className={styles.halo} aria-hidden="true" />
          <img
            src={resource(pessoa.avatar.arquivo)}
            srcSet={`${resource(pessoa.avatar.arquivo)} 480w, ${resource(pessoa.avatar.arquivo2x)} 960w`}
            sizes="(max-width: 767px) 220px, 440px"
            width={480}
            height={480}
            alt={text(pessoa.avatar.alt)}
            fetchPriority="high"
          />
        </div>
      </div>

      {/* A glimpse of the hobbies; decorative, the photos are in Hobbies.
          It moves on its own, so it has a pause button (WCAG 2.2.2). */}
      <div className={styles.stripWrap}>
        <div className={styles.strip} data-paused={paused} aria-hidden="true">
          <div className={styles.track}>
            {[...photos, ...photos].map((photo, i) => (
              <img
                key={`${photo.arquivo}-${i}`}
                src={resource(photo.arquivo)}
                alt=""
                width={160}
                height={160}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          className={styles.pause}
          aria-pressed={paused}
          aria-label={
            paused ? t('landing.playPhotos') : t('landing.pausePhotos')
          }
          onClick={() => setPaused((v) => !v)}
        >
          {paused ? (
            <Play size={16} weight="fill" aria-hidden="true" />
          ) : (
            <Pause size={16} weight="fill" aria-hidden="true" />
          )}
        </button>
      </div>
    </section>
  );
};
