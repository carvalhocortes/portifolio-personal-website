import React, { lazy, Suspense } from 'react';
import remarkGfm from 'remark-gfm';

const ReactMarkdown = lazy(() => import('react-markdown'));

interface MarkdownRendererProps {
  children: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
}) => {
  return (
    <Suspense fallback={<div>...</div>}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </Suspense>
  );
};
