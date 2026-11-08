import { useTranslation } from 'react-i18next';
import { pick } from '../../Content';
import type { ProgramDefinition } from './types';

/** The program name (icon, menu, taskbar) and window title in the current language. */
export const useProgramTitles = () => {
  const { t, i18n } = useTranslation();

  const nameOf = (program: ProgramDefinition) =>
    program.name
      ? pick(program.name, i18n.language)
      : t(program.titleKey ?? program.id);

  const windowTitleOf = (program: ProgramDefinition) =>
    program.windowTitleKey
      ? t(program.windowTitleKey, { name: nameOf(program) })
      : nameOf(program);

  return { nameOf, windowTitleOf };
};
