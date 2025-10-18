import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Prompt } from './Prompt';

describe('Prompt Component', () => {
  it('should render the prompt symbol', () => {
    render(<Prompt />);
    const promptElement = screen.getByRole('img');
    expect(promptElement).toBeInTheDocument();
    expect(promptElement).toHaveTextContent('❯');
  });

  it('should apply "current" variant by default', () => {
    render(<Prompt />);
    const promptElement = screen.getByRole('img');
    expect(promptElement).toHaveAttribute('aria-label', 'Command prompt');
  });

  it('should apply "history" variant when specified', () => {
    render(<Prompt variant="history" />);
    const promptElement = screen.getByRole('img');
    expect(promptElement).toHaveAttribute('aria-label', 'Previous command');
  });

  it('should accept custom className', () => {
    render(<Prompt className="custom-class" />);
    const promptElement = screen.getByRole('img');
    expect(promptElement).toHaveClass('custom-class');
  });

  it('should have role="img" for accessibility', () => {
    render(<Prompt />);
    const promptElement = screen.getByRole('img');
    expect(promptElement).toBeInTheDocument();
  });

  it('should have appropriate aria-label for each variant', () => {
    const { rerender } = render(<Prompt variant="current" />);
    let promptElement = screen.getByRole('img');
    expect(promptElement).toHaveAttribute('aria-label', 'Command prompt');

    rerender(<Prompt variant="history" />);
    promptElement = screen.getByRole('img');
    expect(promptElement).toHaveAttribute('aria-label', 'Previous command');
  });
});
