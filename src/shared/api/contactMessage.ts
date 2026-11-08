import { CONTACT_FORM } from '../config/contactForm';

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  subject: string;
  /** The hCaptcha token; Web3Forms requires a fresh one for every message. */
  token: string;
  /** Extra fields that travel along, like the honeypot of a form. */
  extra?: FormData;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sends a message to the site owner's inbox through Web3Forms. Throws when it
 * isn't delivered, so callers can show their own error.
 */
export const sendContactMessage = async ({
  name,
  email,
  message,
  subject,
  token,
  extra,
}: ContactMessage): Promise<void> => {
  const data = extra ?? new FormData();
  data.set('name', name);
  data.set('email', email);
  data.set('message', message);
  data.set('access_key', CONTACT_FORM.accessKey);
  // The hCaptcha widget may have added its own field already: set, don't add.
  data.set('h-captcha-response', token);
  data.set('subject', subject);
  data.set('from_name', name);

  const response = await fetch(CONTACT_FORM.endpoint, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: data,
  });
  const result = (await response.json()) as { success?: boolean };
  if (!response.ok || !result.success) throw new Error('not sent');
};
