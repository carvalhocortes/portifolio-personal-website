import type HCaptchaType from '@hcaptcha/react-hcaptcha';
import {
  CheckCircle,
  PaperPlaneTilt,
  WarningCircle,
} from '@phosphor-icons/react';
import {
  lazy,
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { content } from '../../../entities/Content';
import { CONTACT_FORM } from '../../../shared/config/contactForm';
import { useContentLanguage } from '../lib/useContentLanguage';
import styles from './ContactForm.module.css';

type Field = 'name' | 'email' | 'message' | 'captcha';
type Status = 'idle' | 'sending' | 'sent' | 'failed';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The captcha (its code and hCaptcha's own script and frames) loads only when
// the form comes near the screen or someone starts filling it, so it doesn't
// compete with the rest of the page on the first load.
const HCaptcha = lazy(() => import('@hcaptcha/react-hcaptcha'));
const NEAR_SCREEN = '400px';

export const ContactForm = () => {
  const { t, language } = useContentLanguage();
  const id = useId();
  const captchaRef = useRef<HCaptchaType>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // Without IntersectionObserver (old browsers, tests), load it right away.
  const [captchaWanted, setCaptchaWanted] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (captchaWanted || !form) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting))
          setCaptchaWanted(true);
      },
      { rootMargin: NEAR_SCREEN }
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, [captchaWanted]);

  // The form is replaced by the thank-you note; keep the keyboard focus there.
  useEffect(() => {
    if (status === 'sent') successRef.current?.focus();
  }, [status]);

  if (!CONTACT_FORM.accessKey) {
    return (
      <p className={styles.note}>
        <span>
          {t('landing.form.notConfigured')}{' '}
          <a href={content.contato.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          .
        </span>
      </p>
    );
  }

  const validate = (data: FormData) => {
    const found: Partial<Record<Field, string>> = {};
    const name = String(data.get('name') ?? '').trim();
    const from = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    if (!name) found.name = t('landing.form.required');
    if (!from) found.email = t('landing.form.required');
    else if (!EMAIL_PATTERN.test(from))
      found.email = t('landing.form.invalidEmail');
    if (!message) found.message = t('landing.form.required');
    if (!token) found.captcha = t('landing.form.captcha');
    return found;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus('sending');
    data.append('access_key', CONTACT_FORM.accessKey);
    data.set('h-captcha-response', token);
    data.append(
      'subject',
      t('landing.form.subject', { name: String(data.get('name')).trim() })
    );
    data.append('from_name', String(data.get('name')).trim());

    try {
      const response = await fetch(CONTACT_FORM.endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const result = (await response.json()) as { success?: boolean };
      if (!response.ok || !result.success) throw new Error('not sent');
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('failed');
    } finally {
      // A captcha token works once; ask for a new one either way.
      captchaRef.current?.resetCaptcha();
      setToken('');
    }
  };

  if (status === 'sent') {
    return (
      <div
        ref={successRef}
        className={styles.success}
        role="status"
        tabIndex={-1}
      >
        <CheckCircle size={28} weight="duotone" aria-hidden="true" />
        <p>{t('landing.form.success')}</p>
      </div>
    );
  }

  const fieldProps = (field: Exclude<Field, 'captcha'>) => ({
    id: `${id}-${field}`,
    name: field,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${id}-${field}-error` : undefined,
  });

  const errorText = (field: Field) =>
    errors[field] && (
      <p id={`${id}-${field}-error`} className={styles.error}>
        {errors[field]}
      </p>
    );

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={onSubmit}
      onFocus={() => setCaptchaWanted(true)}
      noValidate
    >
      <h3 className={styles.title}>{t('landing.form.title')}</h3>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>{t('landing.form.name')}</label>
          <input {...fieldProps('name')} type="text" autoComplete="name" />
          {errorText('name')}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-email`}>{t('landing.form.email')}</label>
          <input
            {...fieldProps('email')}
            type="email"
            autoComplete="email"
            spellCheck={false}
          />
          {errorText('email')}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-message`}>{t('landing.form.message')}</label>
        <textarea {...fieldProps('message')} rows={5} />
        {errorText('message')}
      </div>

      {/* Honeypot: people never see it; bots that fill it are dropped. */}
      <input
        type="checkbox"
        name="botcheck"
        className={styles.honeypot}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className={styles.captcha}>
        {captchaWanted && (
          <Suspense fallback={null}>
            <HCaptcha
              ref={captchaRef}
              sitekey={CONTACT_FORM.hcaptchaSiteKey}
              reCaptchaCompat={false}
              languageOverride={language.startsWith('en') ? 'en' : 'pt-BR'}
              theme="dark"
              onVerify={(value) => {
                setToken(value);
                setErrors((prev) => ({ ...prev, captcha: undefined }));
              }}
              onExpire={() => setToken('')}
            />
          </Suspense>
        )}
        {errors.captcha && (
          <p className={styles.error} role="alert">
            {errors.captcha}
          </p>
        )}
      </div>

      {status === 'failed' && (
        <p className={styles.failure} role="alert">
          <WarningCircle size={20} weight="bold" aria-hidden="true" />
          <span>
            {t('landing.form.error')}{' '}
            <a href={content.contato.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            .
          </span>
        </p>
      )}

      <button
        type="submit"
        className={styles.submit}
        disabled={status === 'sending'}
      >
        {status === 'sending'
          ? t('landing.form.sending')
          : t('landing.form.send')}
        <PaperPlaneTilt size={18} weight="bold" aria-hidden="true" />
      </button>
    </form>
  );
};
