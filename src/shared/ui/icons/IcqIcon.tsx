import React from 'react';
import { PixelIcon } from './PixelIcon';

// The ICQ flower: green petals with a black outline, one red petal and a
// yellow centre. "online" and "offline" are the contact-list versions.
const GRID = [
  '.....KKK.KKK....',
  '....KPPPKPPPK...',
  '..KKKPPPKPPPKKK.',
  '.KPPPKPPKPPKPPPK',
  '.KPPPPKPPPKPPPPK',
  '..KPPPPKKKPPPPK.',
  'KKKKPPKYYYKPPKKK',
  'KPPPPKYYYYYKPPPK',
  'KRRRRKYYYYYKPPPK',
  'KKKKRRKYYYKPPKKK',
  '..KRRRRKKKPPPPK.',
  '.KPPPPKPPPKPPPPK',
  '.KPPPKPPKPPKPPPK',
  '..KKKPPPKPPPKKK.',
  '....KPPPKPPPK...',
  '.....KKK.KKK....',
] as const;

const PETALS = {
  logo: { P: '#33cc33', R: '#e8332a' },
  online: { P: '#33cc33', R: '#33cc33' },
  offline: { P: '#e8332a', R: '#e8332a' },
};

export const IcqIcon: React.FC<{
  size?: number;
  status?: keyof typeof PETALS;
}> = ({ size = 32, status = 'logo' }) => (
  <PixelIcon
    grid={GRID}
    palette={{ '.': null, K: '#000000', Y: '#ffe600', ...PETALS[status] }}
    size={size}
  />
);
