'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copy',
  className = '',
  iconOnly = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          textarea.style.left = '-9999px';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    },
    [text]
  );

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : label}
      title={copied ? 'Copied' : label}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#FF6F59] ${
        copied
          ? 'bg-[#FF6F59]/20 text-[#FF6F59] border border-[#FF6F59]/40'
          : 'bg-[#060D1F] text-[#C8C0AC] hover:text-[#F5EDDC] hover:bg-[#12234A] border border-[#12234A]'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#FF6F59] shrink-0" />
          {!iconOnly && <span className="text-[11px] font-medium text-[#FF6F59]">Copied</span>}
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 shrink-0" />
          {!iconOnly && <span className="text-[11px] font-medium">{label}</span>}
        </>
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  );
};
