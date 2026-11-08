import { content } from '../../../entities/Content';
import { useContentLanguage } from '../lib/useContentLanguage';
import { SECTION_IDS } from './Header';
import { Rich } from './Rich';
import { Section } from './Section';
import styles from './About.module.css';

export const About = () => {
  const { text } = useContentLanguage();
  const { sobre } = content;
  const [first, ...rest] = sobre.paragrafos;

  return (
    <Section id={SECTION_IDS.about} title={text(sobre.titulo)}>
      <div className={styles.body}>
        {first && (
          <Rich className={styles.lead}>
            {`${text(sobre.saudacao)} ${text(first)}`}
          </Rich>
        )}
        <div className={styles.columns}>
          {rest.map((paragraph, i) => (
            <Rich key={i} className={styles.paragraph}>
              {text(paragraph)}
            </Rich>
          ))}
        </div>
      </div>
    </Section>
  );
};
