'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { PasswordToggle } from '../../components/ui/PasswordToggle';
import { AgentLockLogo } from '../../components/ui/AgentLockLogo';
import { api, AuthError } from '../../lib/api-client';
import { sanitizeNextUrl } from '../../lib/auth-utils';
import {
  Loader2,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface LoginFormClientProps {
  initialNext?: string;
}

export function LoginFormClient({ initialNext }: LoginFormClientProps = {}) {
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  const getTargetDestination = (): string => {
    if (initialNext) return sanitizeNextUrl(initialNext);
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      return sanitizeNextUrl(sp.get('next'));
    }
    return '/';
  };
  const targetDestination = getTargetDestination();

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Field validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [capsLockActive, setCapsLockActive] = useState(false);

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  // Form shake trigger
  const [shakeKey, setShakeKey] = useState(0);

  // Refs for focusing first invalid input
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle 429 countdown
  useEffect(() => {
    if (retryCountdown === null || retryCountdown <= 0) {
      if (retryTimerRef.current) clearInterval(retryTimerRef.current);
      setRetryCountdown(null);
      return;
    }

    retryTimerRef.current = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (retryTimerRef.current) clearInterval(retryTimerRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    };
  }, [retryCountdown]);

  // Validation functions
  const validateEmail = (val: string): boolean => {
    if (!val.trim()) {
      setEmailError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      setEmailError('Enter a valid email address.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Password is required.');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  // Keyboard Caps Lock detection
  const handlePasswordKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockActive(e.getModifierState('CapsLock'));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || retryCountdown !== null || isSuccess) return;

    setFormError(null);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid) {
      emailInputRef.current?.focus();
      return;
    }

    if (!isPasswordValid) {
      passwordInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      await api.login({
        email: email.trim(),
        password,
        remember,
      });

      setIsSuccess(true);

      // Brief 400ms success moment before navigation
      const navDelay = prefersReduced ? 50 : 400;
      setTimeout(() => {
        router.replace(targetDestination);
      }, navDelay);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setShakeKey((prev) => prev + 1);

      if (err instanceof AuthError) {
        if (err.status === 429 && err.retryAfterSeconds) {
          setRetryCountdown(err.retryAfterSeconds);
          setFormError(`Too many attempts. Try again in ${err.retryAfterSeconds} seconds.`);
        } else {
          setFormError(err.message || 'Invalid email or password.');
        }
      } else {
        setFormError('Invalid email or password.');
      }
    }
  };

  const fieldVariant = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 10 },
    visible: (customIndex: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReduced ? 0 : 0.35,
        delay: prefersReduced ? 0 : 0.15 + customIndex * 0.06,
      },
    }),
  };

  const shakeAnimation =
    shakeKey > 0 && !prefersReduced
      ? {
          x: [0, -6, 6, -6, 6, -3, 3, 0],
          transition: { duration: 0.3 },
        }
      : {};

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      {/* Left Column on Desktop (Above Form on Mobile): AgentLock Logo */}
      <div className="flex items-center justify-center py-2 lg:py-8">
        <AgentLockLogo />
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full max-w-md mx-auto">
        <motion.div
          animate={shakeAnimation}
          className="p-6 sm:p-8 rounded-xl bg-navy-900 border border-[#1A2E5A] shadow-2xl relative"
        >
          {/* Form Header: Only H1 */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-cream font-display mb-6">
            Log in to AgentLock
          </h1>

          {/* Form Level Error Message */}
          {formError && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 p-3 rounded-lg bg-severity-critical/10 border border-severity-critical/30 text-severity-critical text-xs font-mono flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <motion.div
              custom={0}
              variants={fieldVariant}
              initial="hidden"
              animate="visible"
              className="space-y-1.5"
            >
              <label
                htmlFor="login-email"
                className="block text-xs font-mono text-cream-soft"
              >
                Email
              </label>
              <input
                ref={emailInputRef}
                id="login-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(email)}
                disabled={isSubmitting || isSuccess}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? 'login-email-error' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-lg bg-navy-950 border text-xs font-mono text-cream placeholder-cream-muted/50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-coral ${
                  emailError ? 'border-severity-critical' : 'border-[#1A2E5A] focus:border-coral'
                }`}
                placeholder="developer@organization.com"
              />
              {emailError && (
                <p id="login-email-error" className="text-xs font-mono text-severity-critical">
                  {emailError}
                </p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              custom={1}
              variants={fieldVariant}
              initial="hidden"
              animate="visible"
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-mono text-cream-soft"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-mono text-coral hover:underline focus:outline-none focus:ring-1 focus:ring-coral rounded px-1"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  ref={passwordInputRef}
                  id="login-password"
                  name="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  onKeyDown={handlePasswordKey}
                  onKeyUp={handlePasswordKey}
                  onBlur={() => {
                    validatePassword(password);
                    setCapsLockActive(false);
                  }}
                  disabled={isSubmitting || isSuccess}
                  aria-invalid={Boolean(passwordError)}
                  aria-describedby={
                    passwordError
                      ? 'login-password-error'
                      : capsLockActive
                      ? 'login-password-caps'
                      : undefined
                  }
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-navy-950 border text-xs font-mono text-cream placeholder-cream-muted/50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-coral ${
                    passwordError ? 'border-severity-critical' : 'border-[#1A2E5A] focus:border-coral'
                  }`}
                  placeholder="Enter password"
                />

                <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                  <PasswordToggle
                    isVisible={isPasswordVisible}
                    onToggle={() => setIsPasswordVisible((prev) => !prev)}
                    label={isPasswordVisible ? 'Hide password' : 'Show password'}
                  />
                </div>
              </div>

              {capsLockActive && (
                <p id="login-password-caps" className="text-[11px] font-mono text-amber-400">
                  Caps Lock is on.
                </p>
              )}

              {passwordError && (
                <p id="login-password-error" className="text-xs font-mono text-severity-critical">
                  {passwordError}
                </p>
              )}
            </motion.div>

            {/* Remember Me Checkbox */}
            <motion.div
              custom={2}
              variants={fieldVariant}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-2 pt-1"
            >
              <input
                id="login-remember"
                name="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={isSubmitting || isSuccess}
                className="w-4 h-4 rounded border-[#1A2E5A] bg-navy-950 text-coral focus:ring-coral focus:ring-offset-navy-950 focus:ring-2 accent-[#FF6F59] cursor-pointer"
              />
              <label
                htmlFor="login-remember"
                className="text-xs font-mono text-cream-soft cursor-pointer select-none"
              >
                Keep me signed in
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              custom={3}
              variants={fieldVariant}
              initial="hidden"
              animate="visible"
              className="pt-2"
            >
              <button
                type="submit"
                disabled={isSubmitting || retryCountdown !== null || isSuccess}
                className="w-full h-11 px-4 rounded-lg bg-coral text-navy-950 font-bold text-xs uppercase tracking-wider font-mono hover:bg-coral-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-coral flex items-center justify-center gap-2"
              >
                {isSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-navy-950 stroke-[3]" />
                    <span>Logged in</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
                    <span>Logging in</span>
                  </>
                ) : retryCountdown !== null ? (
                  <span>Retry in {retryCountdown}s</span>
                ) : (
                  <span>Log in</span>
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
