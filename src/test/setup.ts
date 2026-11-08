import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// The desktop boot screen plays once per tab; most tests start past it.
// Boot screen tests clear this mark.
beforeEach(() => {
  sessionStorage.setItem('cc84.booted', '1');
});

afterEach(() => {
  cleanup();
});
