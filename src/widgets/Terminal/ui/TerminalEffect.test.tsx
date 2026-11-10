import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TerminalEffect } from './TerminalEffect';

/** A keydown that happened at `timeStamp` (ms since the page started). */
const keyDownAt = (timeStamp: number) => {
  const event = new KeyboardEvent('keydown', { key: 'Enter' });
  Object.defineProperty(event, 'timeStamp', { value: timeStamp });
  window.dispatchEvent(event);
};

describe('TerminalEffect', () => {
  it('ignores the key that started it, and ends on the next one', () => {
    const onDone = vi.fn();
    render(<TerminalEffect effect="hack" onDone={onDone} />);
    // The Enter that ran the command reaches the window after the effect
    // mounted, but it happened before: it must not end the effect.
    keyDownAt(0);
    expect(onDone).not.toHaveBeenCalled();
    keyDownAt(performance.now() + 1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
