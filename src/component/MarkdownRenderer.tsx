'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={className}>
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="text-xs sm:text-sm mb-3 last:mb-0 leading-relaxed" style={{ color: '#a6adc8' }}>{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold" style={{ color: '#cdd6f4' }}>{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic" style={{ color: '#bac2de' }}>{children}</em>
        ),
        h1: ({ children }) => (
          <h1 className="text-lg font-bold mb-3 mt-5" style={{ color: '#cdd6f4' }}>{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold mb-2 mt-4" style={{ color: '#cdd6f4' }}>{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mb-2 mt-3" style={{ color: '#cdd6f4' }}>{children}</h3>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="underline transition-colors"
            style={{ color: '#89b4fa' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-3 space-y-1" style={{ color: '#a6adc8' }}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-3 space-y-1" style={{ color: '#a6adc8' }}>{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-xs sm:text-sm" style={{ color: '#a6adc8' }}>{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote
            className="pl-4 my-4 italic"
            style={{ borderLeft: '3px solid #cba6f7', color: '#bac2de', backgroundColor: 'rgba(49,50,68,0.5)', padding: '0.5rem 1rem', borderRadius: '0 0.5rem 0.5rem 0' }}
          >
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code
            className="px-1.5 py-0.5 rounded text-xs font-mono"
            style={{ backgroundColor: '#181825', color: '#fab387', border: '1px solid #45475a' }}
          >
            {children}
          </code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
