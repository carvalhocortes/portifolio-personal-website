import { DOS_VERSION } from '../../../shared/config/constants';
import i18n from '../../../shared/i18n';

export const ver = (): string => i18n.t('ver.text', { version: DOS_VERSION });
