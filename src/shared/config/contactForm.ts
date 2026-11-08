/**
 * Contact form backend: Web3Forms (https://web3forms.com) sends each message
 * to the owner's inbox, so the static site needs no server.
 *
 * The access key is meant to be public: it only lets anyone send messages to
 * the address it was created for. While it is empty the form tells visitors
 * to write by email instead.
 * hCaptcha must be enabled for the form in the Web3Forms dashboard; the
 * site key below is the shared one Web3Forms provides on the free plan.
 */
export const CONTACT_FORM = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: '9e833992-73b9-4133-b3e5-8a71153d5c9f',
  hcaptchaSiteKey: '50b2fe65-b00b-4b9e-ad62-3ba471098be2',
};
