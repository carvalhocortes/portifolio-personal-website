import { textList } from '../../../entities/Content';
import { useContentLanguage } from '../lib/useContentLanguage';
import { SECTION_IDS } from '../lib/sections';
import { Rich } from './Rich';
import { Section } from './Section';
import styles from './About.module.css';

export const About = () => {
  const { t } = useContentLanguage();
  const [first, ...rest] = textList(t, 'sobre.paragrafos');

  return (
    <Section id={SECTION_IDS.about} title={t('sobre.titulo')}>
      <div className={styles.body}>
        {first && (
          <Rich className={styles.lead}>
            {`${t('sobre.saudacao')} ${first}`}
          </Rich>
        )}
        <div className={styles.columns}>
          {rest.map((paragraph, i) => (
            <Rich key={i} className={styles.paragraph}>
              {paragraph}
            </Rich>
          ))}
        </div>
      </div>
    </Section>
  );
};
