import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { commandLink } from '../../lib/commandLink';
import { MarkdownRenderer } from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('turns command links into buttons that run the command', async () => {
    const onCommand = vi.fn();
    render(
      <MarkdownRenderer onCommand={onCommand}>
        {`Digite ${commandLink('ajuda')} ou ${commandLink('SOBRE', 'sobre')}`}
      </MarkdownRenderer>
    );

    await userEvent.click(await screen.findByRole('button', { name: 'SOBRE' }));
    expect(onCommand).toHaveBeenCalledWith('sobre');

    await userEvent.click(screen.getByRole('button', { name: 'ajuda' }));
    expect(onCommand).toHaveBeenCalledWith('ajuda');
  });

  it('opens external links in a new tab', async () => {
    render(
      <MarkdownRenderer>
        {'[DeMolay](https://www.demolay.org.br/)'}
      </MarkdownRenderer>
    );
    const link = await screen.findByRole('link', { name: 'DeMolay' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders images with their alt text', async () => {
    render(
      <MarkdownRenderer>{'![Banco](./resources/banco.png)'}</MarkdownRenderer>
    );
    const img = await screen.findByRole('img', { name: 'Banco' });
    expect(img).toHaveAttribute('src', './resources/banco.png');
  });

  it('renders images titled "small" with a size hint and no tooltip', async () => {
    render(
      <MarkdownRenderer>
        {'![Logo](./resources/demolay.png "small")'}
      </MarkdownRenderer>
    );
    const img = await screen.findByRole('img', { name: 'Logo' });
    expect(img).toHaveAttribute('data-size', 'small');
    expect(img).not.toHaveAttribute('title');
  });
});
