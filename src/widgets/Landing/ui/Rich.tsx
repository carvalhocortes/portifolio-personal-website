import ReactMarkdown from 'react-markdown';

interface RichProps {
  children: string;
  className?: string;
}

/** Renders a content text (Markdown: bold, italic, links) as a paragraph. */
export const Rich = ({ children, className }: RichProps) => (
  <ReactMarkdown
    allowedElements={['p', 'strong', 'em', 'a']}
    unwrapDisallowed
    components={{
      p: ({ children: inner }) => <p className={className}>{inner}</p>,
      a: ({ href, children: inner }) => (
        <a href={href} target="_blank" rel="noreferrer">
          {inner}
        </a>
      ),
    }}
  >
    {children}
  </ReactMarkdown>
);
