'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

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

  // Reset typed text when opening
  useEffect(() => {
    if (isOpen) {
      setTypedText('');
      // Body scroll lock
      document.body.style.overflow = 'hidden';
      // Auto focus
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

  // Focus trap & Escape key listener
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDestructive
                  ? 'bg-[rgba(192,80,77,0.15)] text-[#C0504D] border border-[#C0504D]/30'
                  : 'bg-[rgba(230,203,168,0.15)] text-[#E6CBA8] border border-[#B89B72]/30'
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
                className="text-base font-bold text-white font-sans tracking-tight"
              >
                {title}
              </h3>
              <span className="text-[10px] font-mono text-[#8A8A8A] uppercase tracking-wider">
                {isDestructive ? 'Critical Security Action' : 'Action Verification'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#8A8A8A] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#1E1E1E]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          id="confirm-dialog-description"
          className="text-xs text-[#BDBDBD] font-sans leading-relaxed space-y-2"
        >
          {description}
        </div>

        {requiredConfirmationText && (
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-mono text-[#8A8A8A]">
              To confirm, type{' '}
              <span className="text-white font-bold select-all bg-[#1E1E1E] px-1.5 py-0.5 rounded border border-[#2A2A2A]">
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
              className="w-full px-3 py-2 rounded-xl bg-[#151515] border border-[#2A2A2A] text-white text-xs font-mono placeholder-[#5C5C5C] focus:outline-none focus:border-[#E6CBA8] focus:ring-1 focus:ring-[#E6CBA8]"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-mono text-[#BDBDBD] hover:text-white bg-[#151515] hover:bg-[#1E1E1E] border border-[#2A2A2A] transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              isDestructive
                ? 'bg-[#C0504D] text-white hover:bg-[#d05c59] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(192,80,77,0.3)]'
                : 'bg-[#E6CBA8] text-[#0A0A0A] hover:bg-[#F7E7CE] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(230,203,168,0.3)]'
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
