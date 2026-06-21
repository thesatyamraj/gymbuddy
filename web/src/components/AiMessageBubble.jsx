import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Copy, Check, RotateCcw } from 'lucide-react';

/**
 * AI Coach message bubble.
 *
 * User messages reuse the existing sent-bubble look. Assistant messages are
 * rendered from Markdown (bold / lists / headings) with theme-consistent
 * styling, and the LAST assistant message gets Copy + Regenerate actions.
 *
 * Kept visually aligned with MessageBubble.jsx: same alignment logic, same
 * rounded bubble language, primary for the user, surface-raised for the coach.
 */

/** Markdown element → Tailwind class map, tuned to the FITNEX theme. */
const markdownComponents = {
  h1: ({ node, ...props }) => (
    <h1
      className="font-display text-lg font-bold uppercase tracking-wide text-slate-900 mt-3 mb-1.5 first:mt-0"
      {...props}
    />
  ),
  h2: ({ node, ...props }) => (
    <h2
      className="font-display text-base font-bold uppercase tracking-wide text-slate-900 mt-3 mb-1.5 first:mt-0"
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h3
      className="font-semibold text-sm text-slate-800 mt-2.5 mb-1 first:mt-0"
      {...props}
    />
  ),
  p: ({ node, ...props }) => (
    <p className="text-sm leading-relaxed text-slate-700 mb-2 last:mb-0" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc pl-5 space-y-1 mb-2 last:mb-0 text-sm text-slate-700" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal pl-5 space-y-1 mb-2 last:mb-0 text-sm text-slate-700" {...props} />
  ),
  li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
  strong: ({ node, ...props }) => (
    <strong className="font-bold text-primary-600" {...props} />
  ),
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  a: ({ node, ...props }) => (
    <a
      className="text-primary-600 underline hover:text-primary-700"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  code: ({ node, inline, ...props }) =>
    inline ? (
      <code
        className="px-1.5 py-0.5 rounded bg-slate-100 text-primary-700 font-mono text-[13px]"
        {...props}
      />
    ) : (
      <code
        className="block p-3 rounded-lg bg-slate-100 text-slate-800 font-mono text-[13px] overflow-x-auto my-2"
        {...props}
      />
    ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="border-l-2 border-primary-300 pl-3 italic text-slate-500 my-2"
      {...props}
    />
  ),
  hr: () => <hr className="border-slate-200 my-3" />,
};

export default function AiMessageBubble({ message, isLast, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable (e.g. non-HTTPS) — fail silently.
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[80%] px-4 py-2.5 chat-bubble-sent">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3">
      <div className="flex gap-2.5 max-w-[88%]">
        {/* Coach avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow mt-0.5">
          <Bot className="w-4 h-4 text-white" />
        </div>

        <div className="min-w-0">
          <div className="px-4 py-3 chat-bubble-received shadow-card">
            <div className="break-words">
              <ReactMarkdown components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Actions on the last AI message only */}
          {isLast && (
            <div className="flex items-center gap-1 mt-1.5 ml-1">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Copy"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Regenerate"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
