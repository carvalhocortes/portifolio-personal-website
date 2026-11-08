import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { content } from '../../../entities/Content';
import { LandingContent } from '../../../widgets/Landing/ui/LandingContent';

/** /landing (and phones): the landing page alone, full screen. */
const LandingPage = () => {
  const { t } = useTranslation();
  const title = t('landing.pageTitle', { name: content.pessoa.nome });

  useEffect(() => {
    document.title = title;
  }, [title]);

  return <LandingContent />;
};

export default LandingPage;
