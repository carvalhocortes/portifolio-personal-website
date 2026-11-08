import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../shared/i18n';
import { Terminal } from './Terminal';

const lastArticle = () => {
  const articles = screen.getAllByRole('article');
  return articles[articles.length - 1];
};

const lastArticleLabel = () => lastArticle().getAttribute('aria-label');

describe('Terminal (DOS) integration', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('shows the DOS prompt and a blinking cursor', () => {
    render(<Terminal />);
    expect(
      screen.getAllByText('C:\\CARVALHO-CORTES\\>').length
    ).toBeGreaterThan(0);
    expect(screen.getByTestId('dos-cursor')).toBeInTheDocument();
  });

  it('runs a command clicked in the welcome, help and dir output', async () => {
    const user = userEvent.setup();
    render(<Terminal />);

    await user.click(await screen.findByRole('button', { name: 'ajuda' }));
    expect(lastArticleLabel()).toBe('Command: ajuda');

    const help = lastArticle();
    await user.click(await within(help).findByRole('button', { name: 'dir' }));
    expect(lastArticleLabel()).toBe('Command: dir');

    const dir = lastArticle();
    await user.click(
      await within(dir).findByRole('button', { name: 'HOBBIES' })
    );
    expect(lastArticleLabel()).toBe('Command: hobbies');
    const hobbies = lastArticle();
    await within(hobbies).findByRole('img', {
      name: 'Banco do hall do apartamento',
    });
    expect(hobbies.querySelectorAll('img')).toHaveLength(10);
  });

  it('includes clicked commands in the ArrowUp history and keeps it after cls', async () => {
    const user = userEvent.setup();
    render(<Terminal />);

    await user.click(await screen.findByRole('button', { name: 'SOBRE' }));
    const input = screen.getByLabelText(
      'Terminal command input'
    ) as HTMLInputElement;
    await user.type(input, 'cls{Enter}');
    expect(screen.getAllByRole('article')).toHaveLength(1);

    await user.type(input, '{ArrowUp}');
    expect(input.value).toBe('cls');
    await user.type(input, '{ArrowUp}');
    expect(input.value).toBe('sobre');
  });

  it('keeps old links working and clears in English after switching language', async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    const input = screen.getByLabelText(
      'Terminal command input'
    ) as HTMLInputElement;

    await user.type(input, 'idioma{Enter}');
    expect(i18n.language).toBe('en-US');

    // SOBRE link was rendered in Portuguese before the switch.
    await user.click(screen.getAllByRole('button', { name: 'SOBRE' })[0]);
    expect(lastArticle()).not.toHaveTextContent('Bad command or file name');

    await user.type(input, 'clear{Enter}');
    expect(screen.getAllByRole('article')).toHaveLength(1);

    await i18n.changeLanguage('pt-BR');
  });

  it('gives each command a unique id when run in quick succession', async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    const sobre = await screen.findByRole('button', { name: 'SOBRE' });
    await user.dblClick(sobre);
    const labels = screen
      .getAllByRole('article')
      .map((a) => a.getAttribute('aria-label'));
    expect(labels.filter((l) => l === 'Command: sobre')).toHaveLength(2);
  });

  it('puts the keyboard back on the prompt after a clicked command (mouse)', async () => {
    const user = userEvent.setup();
    const matchMedia = window.matchMedia;
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === '(pointer: fine)',
    })) as unknown as typeof window.matchMedia;

    render(<Terminal />);
    await user.click(await screen.findByRole('button', { name: 'AJUDA' }));
    const prompt = screen.getByLabelText('Terminal command input');
    expect(prompt).toHaveFocus();

    // ArrowUp now recalls the clicked command instead of scrolling the page.
    await user.keyboard('{ArrowUp}');
    expect(prompt).toHaveValue('ajuda');

    window.matchMedia = matchMedia;
  });

  it('does not move focus on touch screens, so the keyboard stays closed', async () => {
    const user = userEvent.setup();
    const matchMedia = window.matchMedia;
    window.matchMedia = vi.fn(() => ({
      matches: false,
    })) as unknown as typeof window.matchMedia;

    render(<Terminal />);
    await user.click(await screen.findByRole('button', { name: 'AJUDA' }));
    expect(screen.getByLabelText('Terminal command input')).not.toHaveFocus();

    window.matchMedia = matchMedia;
  });
});
