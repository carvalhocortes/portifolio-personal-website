import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { content } from '../../../entities/Content';
import i18n from '../../../shared/i18n';
import DesktopPage from '../../../pages/DesktopPage/ui/DesktopPage';

const notepad = () =>
  screen.getByRole('region', { name: 'Leia-me.txt - Bloco de Notas' });

describe('Notepad (Leia-me.txt)', () => {
  beforeEach(async () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1280,
      configurable: true,
    });
    await act(() => i18n.changeLanguage('pt-BR'));
  });

  it('shows the Leia-me text from content/site.yaml, without saving edits', async () => {
    const user = userEvent.setup();
    render(<DesktopPage />);
    const text = within(notepad()).getByRole('textbox', {
      name: 'Leia-me.txt',
    });
    expect(text).toHaveValue(content.leiame.texto.pt);
    // It doesn't grab the focus on its own.
    expect(text).not.toHaveFocus();

    await user.click(text);
    await user.keyboard('{Control>}a{/Control}Oi');
    expect(text).toHaveValue('Oi');

    // Closing and opening again brings the original text back.
    await user.click(within(notepad()).getByRole('button', { name: 'Fechar' }));
    const icons = screen.getByRole('list', { name: 'Programas' });
    await user.click(
      within(icons).getByRole('button', { name: 'Leia-me.txt' })
    );
    expect(
      within(notepad()).getByRole('textbox', { name: 'Leia-me.txt' })
    ).toHaveValue(content.leiame.texto.pt);
  });

  it('switches the text and the window title with the language', async () => {
    render(<DesktopPage />);
    await act(() => i18n.changeLanguage('en-US'));
    const window = screen.getByRole('region', {
      name: 'Readme.txt - Notepad',
    });
    expect(
      within(window).getByRole('textbox', { name: 'Readme.txt' })
    ).toHaveValue(content.leiame.texto.en);
  });

  it('shows a decorative menu that is out of the keyboard and screen readers', () => {
    render(<DesktopPage />);
    const menu = within(notepad()).getByText('rquivo').closest('div')!;
    expect(menu).toHaveAttribute('aria-hidden', 'true');
    expect(menu.querySelector('button, a, [tabindex]')).toBeNull();
  });
});
