import { ArrowUpRight, Lightbulb } from '@phosphor-icons/react';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { content, resource, textList } from '../../../entities/Content';
import { useContentLanguage } from '../lib/useContentLanguage';
import { SECTION_IDS } from './Header';
import { Lightbox } from './Lightbox';
import { Rich } from './Rich';
import { Section } from './Section';
import styles from './Hobbies.module.css';

export const Hobbies = () => {
  const { t } = useContentLanguage();
  const { hobbies } = content;
  const [active, setActive] = useState(0);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const hobby = hobbies.itens[active];
  // Texts of a hobby live at hobbies.itens.<id> in the i18n files.
  const key = `hobbies.itens.${hobby.id}`;
  const title = t(`${key}.titulo`);
  const photos = hobby.fotos.map((photo, i) => ({
    src: resource(photo.arquivo),
    caption: t(`${key}.fotos.${i}.legenda`),
  }));

  // Tabs pattern: arrows move between tabs, Home/End jump to the ends.
  const onTabKey = (e: KeyboardEvent) => {
    const last = hobbies.itens.length - 1;
    const next =
      e.key === 'ArrowRight'
        ? active === last
          ? 0
          : active + 1
        : e.key === 'ArrowLeft'
          ? active === 0
            ? last
            : active - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <Section
      id={SECTION_IDS.hobbies}
      title={t('hobbies.titulo')}
      className={styles.section}
    >
      <div role="tablist" className={styles.tabs} onKeyDown={onTabKey}>
        {hobbies.itens.map((item, i) => (
          <button
            key={item.id}
            ref={(node) => {
              tabRefs.current[i] = node;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${item.id}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-panel`}
            tabIndex={i === active ? 0 : -1}
            className={styles.tab}
            onClick={() => setActive(i)}
          >
            {t(`hobbies.itens.${item.id}.titulo`)}
          </button>
        ))}
      </div>

      <div
        key={hobby.id}
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${hobby.id}`}
        className={styles.panel}
      >
        <div className={styles.text}>
          <h3 className={styles.hobbyTitle}>{title}</h3>
          {textList(t, `${key}.paragrafos`).map((paragraph, i) => (
            <Rich key={i} className={styles.paragraph}>
              {paragraph}
            </Rich>
          ))}
          {hobby.curiosidade && (
            <aside className={styles.fact}>
              <Lightbulb size={22} weight="duotone" aria-hidden="true" />
              <p>
                <strong>{t(`${key}.curiosidade.rotulo`)}</strong>{' '}
                {t(`${key}.curiosidade.texto`)}{' '}
                <a
                  href={hobby.curiosidade.link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t(`${key}.curiosidade.link.texto`)}
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </a>
              </p>
            </aside>
          )}
        </div>

        <ul
          className={styles.gallery}
          data-count={photos.length}
          aria-label={t('landing.photoGallery', { title })}
        >
          {photos.map((photo, i) => (
            <li key={photo.src}>
              <button
                type="button"
                className={styles.photo}
                aria-label={t('landing.openPhoto', { caption: photo.caption })}
                onClick={() => setPhotoIndex(i)}
              >
                <img
                  src={photo.src}
                  alt=""
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.photoCaption}>{photo.caption}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Lightbox photos={photos} index={photoIndex} onChange={setPhotoIndex} />
    </Section>
  );
};
