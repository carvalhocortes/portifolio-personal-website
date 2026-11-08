import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { content } from '../../../entities/Content';
import i18n from '../../../shared/i18n';
import LandingPage from './LandingPage';

// The captcha is a third-party iframe; the stub "solves" it on click.
vi.mock('@hcaptcha/react-hcaptcha', async () => {
  const { forwardRef, useImperativeHandle } = await import('react');
  return {
    default: forwardRef(function HCaptchaStub(
      props: { onVerify: (token: string) => void },
      ref
    ) {
      useImperativeHandle(ref, () => ({ resetCaptcha: () => undefined }));
      // Like the real widget, it adds its own h-captcha-response field.
      return (
        <>
          <textarea
            name="h-captcha-response"
            defaultValue="captcha-token"
            hidden
          />
          <button type="button" onClick={() => props.onVerify('captcha-token')}>
            solve captcha
          </button>
        </>
      );
    }),
  };
});

beforeEach(async () => {
  await act(() => i18n.changeLanguage('pt-BR'));
});

afterEach(() => {
  vi.restoreAllMocks();
});

const renderPage = () => {
  const user = userEvent.setup();
  render(<LandingPage />);
  return user;
};

describe('LandingPage', () => {
  it('shows the signature in the header, named for screen readers', () => {
    renderPage();
    const brand = screen.getByRole('link', { name: content.pessoa.nome });
    expect(brand).toHaveAttribute('href', '#inicio');
    const signature = brand.querySelector('span')!;
    expect(signature.style.getPropertyValue('--signature')).toContain(
      `/resources/${content.pessoa.assinatura.arquivo}`
    );
  });

  it('shows the hero and the four sections from content/site.yaml', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: content.pessoa.nome })
    ).toBeInTheDocument();
    expect(screen.getByText(content.pessoa.titulo.pt)).toBeInTheDocument();
    for (const title of [
      content.sobre.titulo.pt,
      content.hobbies.titulo.pt,
      content.voluntario.titulo.pt,
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: title })
      ).toBeInTheDocument();
    }
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: content.contato.titulo.pt.replace(/:\s*$/, ''),
      })
    ).toBeInTheDocument();
  });

  it('links the menu to each section anchor', () => {
    renderPage();
    const nav = screen.getByRole('navigation', { name: 'Seções' });
    const hrefs = within(nav)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(['#sobre', '#hobbies', '#voluntario', '#contato']);
    for (const id of ['sobre', 'hobbies', 'voluntario', 'contato']) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it('never mentions the desktop or the terminal', () => {
    renderPage();
    expect(document.body.textContent).not.toMatch(/terminal|desktop/i);
    expect(document.querySelector('a[href*="desktop"]')).toBeNull();
  });

  it('switches every text to English and back', async () => {
    const user = renderPage();
    await user.click(screen.getByRole('button', { name: /mudar o idioma/i }));
    expect(
      screen.getByRole('heading', { level: 2, name: 'About' })
    ).toBeInTheDocument();
    expect(screen.getByText(content.pessoa.resumo.en)).toBeInTheDocument();
    expect(document.title).toBe(`${content.pessoa.nome} - Software engineer`);

    await user.click(
      screen.getByRole('button', { name: /switch the language/i })
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Sobre' })
    ).toBeInTheDocument();
    expect(document.title).toBe(
      `${content.pessoa.nome} - Engenheiro de software`
    );
  });

  it('opens and closes the mobile menu, also with Escape', async () => {
    const user = renderPage();
    // The button only shows on phones (CSS hides it at jsdom's desktop width,
    // which also blanks its accessible name), so it is found by its state.
    const button = document.querySelector<HTMLButtonElement>(
      'header button[aria-expanded]'
    )!;
    expect(button).toHaveAttribute('aria-label', 'Menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-label', 'Fechar o menu');
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('lets the visitor pause the moving photo strip', async () => {
    const user = renderPage();
    const button = screen.getByRole('button', { name: 'Pausar as fotos' });
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAccessibleName('Continuar as fotos');
  });

  it('shows the about text with the computed age', () => {
    renderPage();
    const about = document.getElementById('sobre')!;
    expect(about.textContent).toMatch(
      new RegExp(`Olá, meu nome é ${content.pessoa.nome}, tenho \\d+ anos`)
    );
    expect(about.textContent).not.toContain('{idade}');
  });
});

describe('Hobbies', () => {
  it('switches hobbies with clicks and arrow keys', async () => {
    const user = renderPage();
    const [wood, photo] = content.hobbies.itens;
    const tab = screen.getByRole('tab', { name: photo.titulo.pt });
    await user.click(tab);
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('heading', { level: 3, name: photo.titulo.pt })
    ).toBeInTheDocument();
    expect(screen.getByText(photo.curiosidade!.texto.pt)).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    const woodTab = screen.getByRole('tab', { name: wood.titulo.pt });
    expect(woodTab).toHaveAttribute('aria-selected', 'true');
    expect(woodTab).toHaveFocus();
  });

  it('opens a photo, moves with the arrows and closes', async () => {
    const user = renderPage();
    const [wood] = content.hobbies.itens;
    await user.click(
      screen.getByRole('button', {
        name: `Ampliar a foto: ${wood.fotos[0].legenda.pt}`,
      })
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(
      within(dialog).getByRole('button', { name: 'Fechar' })
    ).toHaveFocus();
    // The page behind the photo is out of reach.
    expect(
      document.getElementById('conteudo')!.closest('[inert]')
    ).not.toBeNull();
    expect(
      within(dialog).getByText(`Foto 1 de ${wood.fotos.length}`)
    ).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole('button', { name: 'Próxima foto' })
    );
    expect(
      within(dialog).getByText(wood.fotos[1].legenda.pt)
    ).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(
      within(dialog).getByText(`Foto 1 de ${wood.fotos.length}`)
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.querySelector('[inert]')).toBeNull();
    expect(
      screen.getByRole('button', {
        name: `Ampliar a foto: ${wood.fotos[0].legenda.pt}`,
      })
    ).toHaveFocus();
  });

  it('closes the photo with Escape and keeps Tab inside it', async () => {
    const user = renderPage();
    const wood = content.hobbies.itens[0];
    await user.click(
      screen.getByRole('button', {
        name: `Ampliar a foto: ${wood.fotos[0].legenda.pt}`,
      })
    );
    const dialog = screen.getByRole('dialog');
    const buttons = within(dialog).getAllByRole('button');
    buttons[buttons.length - 1].focus();
    await user.tab();
    expect(buttons[0]).toHaveFocus();
    await user.tab({ shift: true });
    expect(buttons[buttons.length - 1]).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Volunteer', () => {
  it('lists every volunteer work with its logo and link', () => {
    renderPage();
    for (const item of content.voluntario.itens) {
      expect(screen.getByAltText(item.logo.alt.pt)).toBeInTheDocument();
      const link = screen.getByRole('link', {
        name: `${item.nome.pt} (abre em outra aba)`,
      });
      expect(link).toHaveAttribute('href', item.url);
      expect(link).toHaveAttribute('target', '_blank');
    }
  });
});

describe('Contact form', () => {
  const fill = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText('Nome'), 'Ana');
    await user.type(screen.getByLabelText('Seu e-mail'), 'ana@exemplo.com');
    await user.type(screen.getByLabelText('Mensagem'), 'Olá!');
  };

  it('does not show the email address on the page', () => {
    renderPage();
    expect(document.body.innerHTML).not.toContain(content.contato.email);
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it('loads the captcha only near the form or when someone starts filling it', async () => {
    let notify: (entries: { isIntersecting: boolean }[]) => void = () => {};
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: typeof notify) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
      }
    );
    try {
      const user = renderPage();
      expect(
        screen.queryByRole('button', { name: 'solve captcha' })
      ).toBeNull();
      // Still far from the screen: nothing loads.
      act(() => notify([{ isIntersecting: false }]));
      expect(
        screen.queryByRole('button', { name: 'solve captcha' })
      ).toBeNull();
      // Starting to fill the form loads it.
      await user.click(screen.getByLabelText('Nome'));
      expect(
        await screen.findByRole('button', { name: 'solve captcha' })
      ).toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('asks for every field and the captcha before sending', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = renderPage();
    await user.click(screen.getByRole('button', { name: /enviar mensagem/i }));
    expect(screen.getAllByText('Preencha este campo.')).toHaveLength(3);
    expect(
      screen.getByText('Confirme que você não é um robô.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveFocus();
    expect(fetchSpy).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Seu e-mail'), 'ana');
    await user.click(screen.getByRole('button', { name: /enviar mensagem/i }));
    expect(screen.getByText(/Digite um e-mail válido/)).toBeInTheDocument();
  });

  it('sends the message with the captcha token and thanks the visitor', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ success: true })));
    const user = renderPage();
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'solve captcha' }));
    await user.click(screen.getByRole('button', { name: /enviar mensagem/i }));

    expect(await screen.findByRole('status')).toHaveFocus();
    expect(await screen.findByText(/Mensagem enviada/)).toBeInTheDocument();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.web3forms.com/submit');
    const body = init!.body as FormData;
    expect(body.getAll('h-captcha-response')).toEqual(['captcha-token']);
    expect(body.get('access_key')).toBeTruthy();
    expect(body.get('message')).toBe('Olá!');
  });

  it('explains the failure and points to LinkedIn', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 400 })
    );
    const user = renderPage();
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'solve captcha' }));
    await user.click(screen.getByRole('button', { name: /enviar mensagem/i }));
    const alert = await screen.findByRole('alert');
    expect(
      within(alert).getByRole('link', { name: 'LinkedIn' })
    ).toHaveAttribute('href', content.contato.linkedin);
    expect(alert).not.toHaveTextContent(content.contato.email);
  });
});
