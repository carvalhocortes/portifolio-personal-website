import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import i18n from '../../../shared/i18n';
import { RecycleBin } from './RecycleBin';

const renderBin = () => {
  const user = userEvent.setup();
  render(<RecycleBin isActive />);
  return user;
};
const address = () => screen.getByRole('textbox', { name: 'Endereço' });

describe('RecycleBin', () => {
  beforeEach(async () => {
    await act(() => i18n.changeLanguage('pt-BR'));
  });

  it('shows the project folders, and Back is off at the top', () => {
    renderBin();
    expect(
      screen.getByRole('button', { name: 'Projeto exemplo' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeDisabled();
    expect(address()).toHaveValue('Lixeira');
    expect(screen.getByText('1 objeto')).toBeInTheDocument();
  });

  it('opens a folder, a text and a photo, and goes back with Back and Esc', async () => {
    const user = renderBin();
    await user.click(screen.getByRole('button', { name: 'Projeto exemplo' }));
    expect(address()).toHaveValue('Lixeira\\Projeto exemplo');
    expect(screen.getByText('2 objetos')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'leia-me.txt' }));
    const text = screen.getByRole('textbox', { name: 'leia-me.txt' });
    expect(text).toHaveValue(
      i18n.t('lixeira.pastas.exemplo.arquivos.leia-me.texto')
    );
    expect(text).toHaveAttribute('readonly');
    expect(text).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Próximo arquivo' }));
    expect(
      screen.getByRole('img', { name: 'foto-provisoria.svg' })
    ).toHaveAttribute('src', '/resources/lixeira/exemplo/placeholder.svg');
    expect(address()).toHaveValue(
      'Lixeira\\Projeto exemplo\\foto-provisoria.svg'
    );

    await user.keyboard('{Escape}');
    expect(address()).toHaveValue('Lixeira\\Projeto exemplo');
    await user.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(address()).toHaveValue('Lixeira');
  });

  it('moves between files with the arrow keys', async () => {
    const user = renderBin();
    await user.click(screen.getByRole('button', { name: 'Projeto exemplo' }));
    await user.click(screen.getByRole('button', { name: 'leia-me.txt' }));
    await user.keyboard('{ArrowLeft}');
    expect(
      screen.getByRole('img', { name: 'foto-provisoria.svg' })
    ).toBeInTheDocument();
  });
});
