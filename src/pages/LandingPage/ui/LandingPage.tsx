import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { About } from '../../../widgets/Landing/ui/About';
import { Contact } from '../../../widgets/Landing/ui/Contact';
import { Footer } from '../../../widgets/Landing/ui/Footer';
import { Header } from '../../../widgets/Landing/ui/Header';
import { Hero } from '../../../widgets/Landing/ui/Hero';
import { Hobbies } from '../../../widgets/Landing/ui/Hobbies';
import { Volunteer } from '../../../widgets/Landing/ui/Volunteer';
import styles from './LandingPage.module.css';
import './landing.css';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  // Screen readers and translators read <html lang>; keep it with the site.
  useEffect(() => {
    document.documentElement.lang = language.startsWith('en') ? 'en' : 'pt-BR';
  }, [language]);

  return (
    <>
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
    </>
  );
};

export default LandingPage;
