import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { content } from '../../../entities/Content';
import i18n from '../../../shared/i18n';
import { Icq } from './Icq';

// The captcha is a third-party iframe; the stub "solves" it on click.
vi.mock('@hcaptcha/react-hcaptcha', async () => {
  const { forwardRef, useImperativeHandle } = await import('react');
  return {
    default: forwardRef(function HCaptchaStub(
      props: { onVerify: (token: string) => void },
      ref
    ) {
      useImperativeHandle(ref, () => ({ resetCaptcha: () => undefined }));
      return (
        <button type="button" onClick={() => props.onVerify('captcha-token')}>
          solve captcha
        </button>
      );
    }),
  };
});

const fernando = content.pessoa.nome;

const renderIcq = () => {
  const user = userEvent.setup();
  render(<Icq isActive />);
  return user;
};

const okResponse = () =>
  vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );

describe('Icq', () => {
  beforeEach(async () => {
    await act(() => i18n.changeLanguage('pt-BR'));
  });

  afterEach(() => vi.restoreAllMocks());

  it('lists Fernando online and the offline contacts, who get no messages', async () => {
    const user = renderIcq();
    expect(screen.getByRole('button', { name: fernando })).toBeInTheDocument();
    const bug = screen.getByRole('button', {
      name: 'Bug em Produção (offline)',
    });
    await user.click(bug);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Bug em Produção está offline e não pode receber mensagens.'
    );
    expect(screen.queryByRole('log')).toBeNull();
  });

  it('asks for name, e-mail and captcha, sends the message and replies', async () => {
    const fetchSpy = okResponse();
    const user = renderIcq();
    await user.click(screen.getByRole('button', { name: fernando }));

    const box = screen.getByRole('textbox', {
      name: `Mensagem para ${fernando}`,
    });
    await user.type(box, 'Oi, tudo bem?{Enter}');
    const log = screen.getByRole('log');
    expect(log).toHaveTextContent('Você: Oi, tudo bem?');
    expect(box).toBeDisabled();

    // Nothing filled: errors, nothing sent.
    await user.click(
      screen.getByRole('button', { name: `Enviar para o ${fernando}` })
    );
    expect(screen.getAllByText('Preencha este campo.')).toHaveLength(2);
    expect(
      screen.getByText('Confirme que você não é um robô.')
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Nome'), 'Ana');
    await user.type(screen.getByLabelText('Seu e-mail'), 'ana@exemplo.com');
    await user.click(
      await screen.findByRole('button', { name: 'solve captcha' })
    );
    await user.click(
      screen.getByRole('button', { name: `Enviar para o ${fernando}` })
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const body = fetchSpy.mock.calls[0][1]!.body as FormData;
    expect(body.get('name')).toBe('Ana');
    expect(body.get('email')).toBe('ana@exemplo.com');
    expect(body.get('message')).toBe('Oi, tudo bem?');
    expect(body.get('h-captcha-response')).toBe('captcha-token');
    expect(body.get('subject')).toBe('Mensagem pelo chat do site - Ana');
    expect(
      await within(log).findByText(
        /Recebi sua mensagem\. Já te respondo no ana@exemplo\.com/
      )
    ).toBeInTheDocument();
    expect(box).toBeEnabled();

    // A second message only asks for the captcha again.
    await user.type(box, 'Mais uma coisa{Enter}');
    expect(screen.queryByLabelText('Nome')).toBeNull();
    expect(
      screen.getByText('Confirme que você não é um robô para enviar:')
    ).toBeInTheDocument();
  });

  it('shows the error and LinkedIn when sending fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 400 })
    );
    const user = renderIcq();
    await user.click(screen.getByRole('button', { name: fernando }));
    await user.type(
      screen.getByRole('textbox', { name: `Mensagem para ${fernando}` }),
      'Olá{Enter}'
    );
    await user.type(screen.getByLabelText('Nome'), 'Ana');
    await user.type(screen.getByLabelText('Seu e-mail'), 'ana@exemplo.com');
    await user.click(
      await screen.findByRole('button', { name: 'solve captcha' })
    );
    await user.click(
      screen.getByRole('button', { name: `Enviar para o ${fernando}` })
    );
    expect(
      await screen.findByRole('link', { name: 'LinkedIn' })
    ).toHaveAttribute('href', content.contato.linkedin);
  });

  it('breaks the line with Shift+Enter instead of sending', async () => {
    const user = renderIcq();
    await user.click(screen.getByRole('button', { name: fernando }));
    const box = screen.getByRole('textbox', {
      name: `Mensagem para ${fernando}`,
    });
    await user.type(box, 'linha 1{Shift>}{Enter}{/Shift}linha 2');
    expect(box).toHaveValue('linha 1\nlinha 2');
    expect(screen.getByRole('log')).not.toHaveTextContent('Você:');
  });
});
