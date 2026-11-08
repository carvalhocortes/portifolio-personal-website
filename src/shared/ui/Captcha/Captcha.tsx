import type HCaptchaType from '@hcaptcha/react-hcaptcha';
import { lazy, Suspense, type Ref } from 'react';
import { CONTACT_FORM } from '../../config/contactForm';

// hCaptcha's code (and its own script and frames) loads only when a captcha
// is first shown, so it never slows down the first page load.
const HCaptcha = lazy(() => import('@hcaptcha/react-hcaptcha'));

export type CaptchaHandle = HCaptchaType;

interface CaptchaProps {
  captchaRef: Ref<HCaptchaType>;
  /** i18next language; hCaptcha shows in PT or EN. */
  language: string;
  theme?: 'light' | 'dark';
  onVerify: (token: string) => void;
  onExpire: () => void;
}

/** The site's hCaptcha (the Web3Forms key), loaded on demand. */
export const Captcha = ({
  captchaRef,
  language,
  theme = 'light',
  onVerify,
  onExpire,
}: CaptchaProps) => (
  <Suspense fallback={null}>
    <HCaptcha
      ref={captchaRef}
      sitekey={CONTACT_FORM.hcaptchaSiteKey}
      reCaptchaCompat={false}
      languageOverride={language.startsWith('en') ? 'en' : 'pt-BR'}
      theme={theme}
      onVerify={onVerify}
      onExpire={onExpire}
    />
  </Suspense>
);
