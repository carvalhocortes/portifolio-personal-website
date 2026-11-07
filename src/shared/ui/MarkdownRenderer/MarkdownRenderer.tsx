import React, { lazy, Suspense, useMemo } from 'react';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseCommandLink } from '../../lib/commandLink';
import styles from './MarkdownRenderer.module.css';

const ReactMarkdown = lazy(() => import('react-markdown'));

interface MarkdownRendererProps {
  children: string;
  onCommand?: (command: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
  onCommand,
}) => {
  const components = useMemo<Components>(
    () => ({
      a: ({ href, children: label, node: _node, ...rest }) => {
        const command = parseCommandLink(href);
        if (command !== null) {
          return (
            <button
              type="button"
              className={styles.commandLink}
              onClick={(e) => {
                e.stopPropagation();
                onCommand?.(command);
              }}
            >
              {label}
            </button>
          );
        }

        const isExternal = !!href && /^https?:\/\//.test(href);
        return (
          <a
            href={href}
            {...rest}
            {...(isExternal
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {label}
          </a>
        );
      },
      img: ({ node: _node, alt, ...rest }) => (
        <img alt={alt ?? ''} loading="lazy" decoding="async" {...rest} />
      ),
    }),
    [onCommand]
  );

  return (
    <Suspense fallback={<div>…</div>}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </Suspense>
  );
};
