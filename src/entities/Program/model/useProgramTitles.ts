import { useTranslation } from 'react-i18next';
import type { ProgramDefinition } from './types';

/** The program name (icon, menu, taskbar) and window title in the current language. */
export const useProgramTitles = () => {
  const { t } = useTranslation();

  const nameOf = (program: ProgramDefinition) =>
    t(program.titleKey ?? program.id);

  const windowTitleOf = (program: ProgramDefinition) =>
    program.windowTitleKey
      ? t(program.windowTitleKey, { name: nameOf(program) })
      : nameOf(program);

  return { nameOf, windowTitleOf };
};
