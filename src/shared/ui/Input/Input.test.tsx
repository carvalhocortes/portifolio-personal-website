import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './Input';

describe('Input Component', () => {
  it('should render an input', () => {
    render(<Input />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
  });

  it('should accept and display value', () => {
    render(<Input value="test value" readOnly />);
    const inputElement = screen.getByRole('textbox') as HTMLInputElement;
    expect(inputElement.value).toBe('test value');
  });

  it('should call onChange when user types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const inputElement = screen.getByRole('textbox');

    await user.type(inputElement, 'a');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should accept placeholder', () => {
    render(<Input placeholder="Digite algo..." />);
    const inputElement = screen.getByPlaceholderText('Digite algo...');
    expect(inputElement).toBeInTheDocument();
  });

  it('should support autoFocus', () => {
    render(<Input autoFocus />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveFocus();
  });

  it('should accept aria-label for accessibility', () => {
    render(<Input aria-label="Terminal input" />);
    const inputElement = screen.getByLabelText('Terminal input');
    expect(inputElement).toBeInTheDocument();
  });

  it('should support different type', () => {
    const { container } = render(<Input type="password" />);
    const inputElement = container.querySelector('input') as HTMLInputElement;
    expect(inputElement).toBeInTheDocument();
    expect(inputElement.type).toBe('password');
  });

  it('should call onKeyDown', async () => {
    const user = userEvent.setup();
    const handleKeyDown = vi.fn();
    render(<Input onKeyDown={handleKeyDown} />);
    const inputElement = screen.getByRole('textbox');

    await user.type(inputElement, '{Enter}');

    expect(handleKeyDown).toHaveBeenCalled();
  });
});
