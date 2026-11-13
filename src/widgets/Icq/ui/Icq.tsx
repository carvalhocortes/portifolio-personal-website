import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { content } from '../../../entities/Content';
import type { ProgramProps } from '../../../entities/Program/model/types';
import {
  EMAIL_PATTERN,
  sendContactMessage,
} from '../../../shared/api/contactMessage';
import { Captcha, type CaptchaHandle } from '../../../shared/ui/Captcha';
import { IcqIcon } from '../../../shared/ui/icons';
import styles from './Icq.module.css';

type Sender = 'you' | 'fernando' | 'icq';
interface Message {
  id: number;
  from: Sender;
  text: string;
}
interface Identity {
  name: string;
  email: string;
}
type Field = 'name' | 'email' | 'captcha';

/**
 * ICQ-style messenger. Only Fernando is online; the joke contacts are offline
 * and can't get messages. A message to Fernando asks for name, e-mail and the
 * captcha, goes to his inbox (Web3Forms) and gets an automatic reply.
 */
export const Icq = (_props: ProgramProps) => {
  const { t } = useTranslation();
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [notice, setNotice] = useState('');

  if (view === 'chat') return <Chat onBack={() => setView('list')} />;

  return (
    <div className={styles.icq}>
      <div className={styles.header}>
        <IcqIcon size={24} />
        <span className={styles.brand}>{t('icq.name')}</span>
        <span className={styles.status}>{t('icq.online')}</span>
      </div>
      <div className={styles.list}>
        <p className={styles.group}>{t('icq.groupOnline')}</p>
        <ul className={styles.contacts}>
          <li>
            <button
              type="button"
              className={styles.contact}
              onClick={() => {
                setNotice('');
                setView('chat');
              }}
            >
              <IcqIcon size={16} status="online" />
              <span>{content.pessoa.nome}</span>
            </button>
          </li>
        </ul>
        <p className={styles.group}>{t('icq.groupOffline')}</p>
        <ul className={styles.contacts}>
          {content.icq.contatos.map(({ id }) => {
            const name = t(`icq.contatos.${id}.nome`);
            return (
              <li key={id}>
                <button
                  type="button"
                  className={`${styles.contact} ${styles.offline}`}
                  aria-label={t('icq.offlineContact', { name })}
                  onClick={() => setNotice(t('icq.offlineNotice', { name }))}
                >
                  <IcqIcon size={16} status="offline" />
                  <span>{name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <p className={styles.statusBar} role="status">
        {notice}
      </p>
    </div>
  );
};

const Chat = ({ onBack }: { onBack: () => void }) => {
  const { t, i18n } = useTranslation();
  const formId = useId();
  const nextId = useRef(1);
  const logRef = useRef<HTMLDivElement>(null);
  const captchaRef = useRef<CaptchaHandle>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  // The message waiting for name, e-mail and captcha before it goes out.
  const [pending, setPending] = useState<string | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const fernando = content.pessoa.nome;

  const add = (from: Sender, text: string) =>
    setMessages((list) => [...list, { id: nextId.current++, from, text }]);

  // Keep the newest message in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, pending]);

  const submitDraft = () => {
    const text = draft.trim();
    if (!text || pending !== null) return;
    add('you', text);
    setDraft('');
    setPending(text);
    setFailed(false);
  };

  const onDraftKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter breaks the line.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitDraft();
    }
  };

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending === null) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = identity?.name ?? String(data.get('name') ?? '').trim();
    const email = identity?.email ?? String(data.get('email') ?? '').trim();
    const found: Partial<Record<Field, string>> = {};
    if (!name) found.name = t('landing.form.required');
    if (!email) found.email = t('landing.form.required');
    else if (!EMAIL_PATTERN.test(email))
      found.email = t('landing.form.invalidEmail');
    if (!token) found.captcha = t('landing.form.captcha');
    setErrors(found);
    if (Object.keys(found).length) {
      form
        .querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)
        ?.focus();
      return;
    }

    setSending(true);
    try {
      await sendContactMessage({
        name,
        email,
        message: pending,
        subject: t('icq.subject', { name }),
        token,
        extra: data,
      });
      setIdentity({ name, email });
      setPending(null);
      setFailed(false);
      add('fernando', t('icq.reply', { name, email }));
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
      // A captcha token works once.
      captchaRef.current?.resetCaptcha();
      setToken('');
    }
  };

  const errorText = (field: Field) =>
    errors[field] && (
      <span id={`${formId}-${field}-error`} className={styles.error}>
        {errors[field]}
      </span>
    );

  return (
    <div className={styles.icq}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.button} onClick={onBack}>
          {t('recycleBin.back')}
        </button>
        <IcqIcon size={16} status="online" />
        <span className={styles.chatTitle}>{fernando}</span>
      </div>

      <div
        ref={logRef}
        className={styles.log}
        role="log"
        aria-live="polite"
        aria-label={t('icq.history', { name: fernando })}
      >
        {messages.length === 0 && (
          <p className={styles.hint}>{t('icq.hint', { name: fernando })}</p>
        )}
        {messages.map((message) => (
          <p key={message.id} className={styles.message}>
            <strong
              className={message.from === 'you' ? styles.you : styles.them}
            >
              {message.from === 'you'
                ? t('icq.you')
                : message.from === 'fernando'
                  ? fernando
                  : t('icq.name')}
              :
            </strong>{' '}
            {message.text}
          </p>
        ))}

        {pending !== null && (
          <form
            className={styles.identify}
            onSubmit={send}
            noValidate
            aria-label={t('icq.identifyTitle')}
          >
            <p className={styles.identifyTitle}>
              {identity
                ? t('icq.captchaOnly')
                : t('icq.identify', { name: fernando })}
            </p>
            {!identity && (
              <>
                <div className={styles.field}>
                  <label htmlFor={`${formId}-name`}>
                    {t('landing.form.name')}
                  </label>
                  <input
                    id={`${formId}-name`}
                    name="name"
                    autoComplete="name"
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={
                      errors.name ? `${formId}-name-error` : undefined
                    }
                  />
                  {errorText('name')}
                </div>
                <div className={styles.field}>
                  <label htmlFor={`${formId}-email`}>
                    {t('landing.form.email')}
                  </label>
                  <input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    spellCheck={false}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={
                      errors.email ? `${formId}-email-error` : undefined
                    }
                  />
                  {errorText('email')}
                </div>
              </>
            )}
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
              <Captcha
                captchaRef={captchaRef}
                language={i18n.language}
                onVerify={(value) => {
                  setToken(value);
                  setErrors((prev) => ({ ...prev, captcha: undefined }));
                }}
                onExpire={() => setToken('')}
              />
              {errors.captcha && (
                <span className={styles.error} role="alert">
                  {errors.captcha}
                </span>
              )}
            </div>
            {failed && (
              <p className={styles.error} role="alert">
                {t('landing.form.error')}{' '}
                <a
                  href={content.contato.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
                .
              </p>
            )}
            <button type="submit" className={styles.button} disabled={sending}>
              {sending
                ? t('landing.form.sending')
                : t('icq.sendTo', { name: fernando })}
            </button>
          </form>
        )}
      </div>

      <div className={styles.compose}>
        <textarea
          className={styles.draft}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onDraftKey}
          aria-label={t('icq.messageTo', { name: fernando })}
          placeholder={t('icq.placeholder')}
          disabled={pending !== null}
          rows={3}
        />
        <button
          type="button"
          className={styles.button}
          onClick={submitDraft}
          disabled={pending !== null || !draft.trim()}
        >
          {t('icq.send')}
        </button>
      </div>
    </div>
  );
};
