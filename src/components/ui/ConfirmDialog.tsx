'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  requiredConfirmationText?: string;
  confirmationPlaceholder?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  requiredConfirmationText,
  confirmationPlaceholder,
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  const [typedText, setTypedText] = useState('');
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTypedText('');
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        if (requiredConfirmationText && inputRef.current) {
          inputRef.current.focus();
        } else if (isDestructive && cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isDestructive, requiredConfirmationText]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isConfirmDisabled =
    isLoading ||
    (requiredConfirmationText
      ? typedText.trim() !== requiredConfirmationText.trim()
      : false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030714]/80 transition-opacity duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[#0A1633] border border-[#12234A] rounded-2xl shadow-[8px_8px_24px_#030714] p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDestructive
                  ? 'bg-[#E11D48]/15 text-[#E11D48] border border-[#E11D48]/30'
                  : 'bg-[#FF6F59]/15 text-[#FF6F59] border border-[#FF6F59]/30'
              }`}
            >
              {isDestructive ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3
                id="confirm-dialog-title"
                className="text-base font-bold text-[#F5EDDC] font-sans tracking-tight"
              >
                {title}
              </h3>
              <span className="text-[10px] font-mono text-[#C8C0AC] uppercase tracking-wider">
                {isDestructive ? 'Critical Security Action' : 'Action Verification'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#C8C0AC] hover:text-[#F5EDDC] transition-colors p-1 rounded-lg hover:bg-[#12234A]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          id="confirm-dialog-description"
          className="text-xs text-[#C8C0AC] font-sans leading-relaxed space-y-2"
        >
          {description}
        </div>

        {requiredConfirmationText && (
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-mono text-[#C8C0AC]">
              To confirm, type{' '}
              <span className="text-[#F5EDDC] font-bold select-all bg-[#060D1F] px-1.5 py-0.5 rounded border border-[#12234A]">
                {requiredConfirmationText}
              </span>{' '}
              below:
            </label>
            <input
              ref={inputRef}
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={confirmationPlaceholder || requiredConfirmationText}
              className="w-full px-3 py-2 rounded-xl bg-[#060D1F] border border-[#12234A] text-[#F5EDDC] text-xs font-mono placeholder-[#C8C0AC]/40 focus:outline-none focus:border-[#FF6F59] focus:ring-1 focus:ring-[#FF6F59]"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-mono text-[#C8C0AC] hover:text-[#F5EDDC] bg-[#060D1F] hover:bg-[#12234A] border border-[#12234A] transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              isDestructive
                ? 'bg-[#E11D48] text-white hover:bg-[#f43f5e] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                : 'bg-[#FF6F59] text-[#060D1F] hover:bg-[#E85A44] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,111,89,0.3)]'
            }`}
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
