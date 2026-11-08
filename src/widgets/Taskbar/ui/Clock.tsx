import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatClock } from '../lib/formatClock';

const TICK_MS = 15_000;

export const Clock: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <time className={className} dateTime={now.toISOString()}>
      {formatClock(now, i18n.language)}
    </time>
  );
};
