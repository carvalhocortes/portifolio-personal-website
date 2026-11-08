import { Terminal } from '../../../widgets/Terminal/ui/Terminal';
import styles from './TerminalPage.module.css';

/** /terminal: the Terminal alone, full screen, without the desktop. */
const TerminalPage = () => (
  <main className={styles.page}>
    <Terminal isActive />
  </main>
);

export default TerminalPage;
