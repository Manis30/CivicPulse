import React, { useState } from 'react';
import { LuChevronDown, LuChevronRight, LuCopy, LuCheck } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface ExecutionResultRendererProps {
  data: any;
  title?: string;
  defaultExpanded?: boolean;
  className?: string;
  isError?: boolean;
}

export function ExecutionResultRenderer({
  data,
  title,
  defaultExpanded = false,
  className,
  isError = false,
}: ExecutionResultRendererProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  // Safely extract string representation
  const formatValue = (val: any): { display: string; isComplex: boolean } => {
    if (val === null) return { display: 'null', isComplex: false };
    if (val === undefined) return { display: 'undefined', isComplex: false };
    if (typeof val === 'string') return { display: val, isComplex: false };
    if (typeof val === 'number' || typeof val === 'boolean') return { display: String(val), isComplex: false };

    if (val instanceof Error) {
      return { display: val.message || 'Error occurred', isComplex: Boolean(val.stack) };
    }

    if (typeof val === 'object') {
      // Check if it has a human-readable message field
      const humanMessage = val.message || val.errorMessage || val.error || val.detail;
      try {
        const json = JSON.stringify(val, null, 2);
        return {
          display: typeof humanMessage === 'string' ? humanMessage : json,
          isComplex: true,
        };
      } catch {
        return { display: '[Circular or Unserializable Object]', isComplex: false };
      }
    }

    return { display: String(val), isComplex: false };
  };

  const { display, isComplex } = formatValue(data);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const textToCopy = typeof data === 'object' ? JSON.stringify(data, null, 2) : display;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }
  };

  if (!isComplex && !title) {
    return (
      <span
        className={cn(
          'text-xs font-mono break-all',
          isError ? 'text-[#FB7185]' : 'text-[#F8FAFC]',
          className
        )}
      >
        {display}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border transition-all text-xs font-sans overflow-hidden',
        isError
          ? 'bg-[#181119] border-[#F0526B]/30'
          : 'bg-[#08111F] border-[rgba(148,163,184,0.14)]',
        className
      )}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer select-none bg-[#101F33]/60 hover:bg-[#13243A]/80 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {expanded ? (
            <LuChevronDown className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          ) : (
            <LuChevronRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          )}
          <span className="font-semibold text-[#F8FAFC] truncate">
            {title || (isError ? 'Error Payload' : 'Execution Result')}
          </span>
          {!expanded && (
            <span className="text-[11px] text-[#94A3B8] truncate font-mono max-w-xs">
              — {display}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#162238] transition-colors"
          title="Copy payload"
        >
          {copied ? (
            <LuCheck className="w-3.5 h-3.5 text-[#22C55E]" />
          ) : (
            <LuCopy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="p-3.5 border-t border-[rgba(148,163,184,0.1)] bg-[#07111F]">
          <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto text-[#94A3B8] whitespace-pre-wrap break-all">
            {typeof data === 'object' ? JSON.stringify(data, null, 2) : display}
          </pre>
        </div>
      )}
    </div>
  );
}
