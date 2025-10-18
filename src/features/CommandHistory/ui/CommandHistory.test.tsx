import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Command } from '../../../entities/Command/model/types';
import { CommandHistory } from './CommandHistory';

const mockCommands: Command[] = [
  { id: 1, text: 'help', output: 'Help information' },
  { id: 2, text: 'about', output: '# About Me\n\nI am a developer' },
  {
    id: 3,
    text: 'contact',
    output: '**Email:** test@example.com\n**GitHub:** @user',
  },
];

describe('CommandHistory Component', () => {
  it('should render empty list when there are no commands', () => {
    const { container } = render(<CommandHistory commands={[]} />);
    const historyContainer = container.querySelector('[role="log"]');
    expect(historyContainer).toBeInTheDocument();
    expect(historyContainer?.children.length).toBe(0);
  });

  it('should render all provided commands', () => {
    render(<CommandHistory commands={mockCommands} />);
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(3);
  });

  it('should display the text of each command', () => {
    render(<CommandHistory commands={mockCommands} />);

    expect(screen.getByText('help')).toBeInTheDocument();
    expect(screen.getByText('about')).toBeInTheDocument();
    expect(screen.getByText('contact')).toBeInTheDocument();
  });

  it('should render the output of each command', async () => {
    render(<CommandHistory commands={mockCommands} />);

    await screen.findByText('Help information');
    expect(screen.getByText('Help information')).toBeInTheDocument();
    expect(screen.getByText('I am a developer')).toBeInTheDocument();
  });

  it('should have role="log" and aria-live="polite" for accessibility', () => {
    const { container } = render(<CommandHistory commands={mockCommands} />);
    const historyContainer = container.querySelector('[role="log"]');

    expect(historyContainer).toHaveAttribute('aria-live', 'polite');
  });

  it('each command should have descriptive aria-label', () => {
    render(<CommandHistory commands={mockCommands} />);

    const article1 = screen.getByLabelText('Command: help');
    const article2 = screen.getByLabelText('Command: about');
    const article3 = screen.getByLabelText('Command: contact');

    expect(article1).toBeInTheDocument();
    expect(article2).toBeInTheDocument();
    expect(article3).toBeInTheDocument();
  });

  it('should display "history" prompt for each command', () => {
    render(<CommandHistory commands={mockCommands} />);
    const prompts = screen.getAllByRole('img');

    expect(prompts).toHaveLength(3);
    prompts.forEach((prompt) => {
      expect(prompt).toHaveAttribute('aria-label', 'Previous command');
    });
  });

  it('should have output region with aria-label', () => {
    render(<CommandHistory commands={mockCommands} />);
    const outputs = screen.getAllByRole('region', { name: 'Command output' });

    expect(outputs).toHaveLength(3);
  });

  it('should render markdown in output', async () => {
    render(<CommandHistory commands={mockCommands} />);

    const heading = await screen.findByText('About Me');
    expect(heading).toBeInTheDocument();

    const emailLabel = screen.getByText(/Email:/);
    expect(emailLabel).toBeInTheDocument();
  });
});
