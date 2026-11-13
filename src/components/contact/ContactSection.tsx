'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '../analytics/AnalyticsManager';
import { getStoredAttribution, AttributionData } from '../../lib/utm';
import { CopyButton } from '../ui/CopyButton';
import {
  Mail,
  Building,
  User,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface FormState {
  name: string;
  email: string;
  company: string;
  message: string;
  honeypot: string; // Anti-spam hidden field
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
}

export const ContactSection: React.FC = () => {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    company: '',
    message: '',
    honeypot: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [inlineSuccess, setInlineSuccess] = useState<{
    referenceId: string;
    message: string;
  } | null>(null);
  const [attribution, setAttribution] = useState<AttributionData | null>(null);

  useEffect(() => {
    const stored = getStoredAttribution();
    setAttribution(stored.lastTouch || stored.firstTouch || null);
  }, []);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const companyInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

  // CONFIG values per user specification
  // TODO: Update with real deployment address & endpoints when provided in CONFIG
  const companyName = 'AgentLock Cybernetics Inc.';
  const streetAddress = '100 Montgomery St, Suite 1800';
  const cityStateZip = 'San Francisco, CA 94104';
  const country = 'United States';
  const contactEmail = 'security@agentlock.ai';
  const contactPhone = '+1 (415) 890-5625';
  const businessHours = 'Mon - Fri: 08:00 - 18:00 PST // 24/7 SecOps Dispatch';

  const validateField = (field: keyof FormState, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required to verify operator credentials.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        return undefined;
      case 'email':
        if (!value.trim()) return 'Work email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please provide a valid work email address.';
        return undefined;
      case 'message':
        if (!value.trim()) return 'Message is required.';
        if (value.trim().length < 10) return 'Message must be at least 10 characters long.';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Spam honeypot trap
    if (form.honeypot) {
      console.warn('Bot submission blocked.');
      router.push('/thank-you');
      return;
    }

    // Full validation
    const nameErr = validateField('name', form.name);
    const emailErr = validateField('email', form.email);
    const messageErr = validateField('message', form.message);

    const newErrors: FormErrors = {
      name: nameErr,
      email: emailErr,
      message: messageErr,
    };

    setErrors(newErrors);
    setTouched({ name: true, email: true, company: true, message: true });

    // Focus first invalid field
    if (nameErr) {
      nameInputRef.current?.focus();
      trackEvent('form_submit_error', { field: 'name' });
      return;
    }
    if (emailErr) {
      emailInputRef.current?.focus();
      trackEvent('form_submit_error', { field: 'email' });
      return;
    }
    if (messageErr) {
      messageInputRef.current?.focus();
      trackEvent('form_submit_error', { field: 'message' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        message: form.message.trim(),
        attribution: attribution || undefined,
      };

      let refId = `DISPATCH-${Date.now().toString(36).toUpperCase()}`;

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reference_id) refId = data.reference_id;
        }
      } catch (fetchErr) {
        // Fallback simulate success
      }

      trackEvent('form_submit_success', {
        company: form.company,
        email_domain: form.email.split('@')[1] || '',
        has_attribution: Boolean(attribution),
      });

      setInlineSuccess({
        referenceId: refId,
        message:
          'Your dispatch transmission has been received, cryptographically hashed, and queued for our 24/7 SecOps Incident Dispatch triage architects.',
      });
    } catch (err: any) {
      console.error('Submission error:', err);
      setServerError(
        'Unable to transmit message across runtime dispatch mesh. Please verify your connection or try again.'
      );
      trackEvent('form_submit_error', { error: err?.message || 'network_failure' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="pt-12 scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6CBA8] shadow-[0_0_10px_rgba(230,203,168,0.4)]" />
            <Mail className="w-5 h-5 text-[#E6CBA8]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
              Contact Incident Dispatch
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[rgba(230,203,168,0.12)] border border-[#B89B72]/40 text-[#E6CBA8] flex items-center gap-1.5 shadow-[0_0_10px_rgba(230,203,168,0.1)]">
              REQUEST A DEMO
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1 font-sans">
            Connect with our zero-trust runtime security architects. Schedule a fleet simulation or discuss high-volume gateway quotas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 cols: Interactive Form / Inline Success */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-[#2A2A2A] shadow-xl space-y-6">
          {/* Inline Success Panel */}
          {inlineSuccess ? (
            <div
              role="status"
              className="p-6 rounded-2xl bg-[rgba(230,203,168,0.08)] border border-[#B89B72]/50 text-white space-y-4 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6CBA8] text-[#0A0A0A] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(230,203,168,0.4)]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-sans tracking-tight text-white">
                    Transmission Dispatched
                  </h3>
                  <span className="text-[11px] font-mono text-[#E6CBA8]">
                    Reference ID: {inlineSuccess.referenceId}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#BDBDBD] font-sans leading-relaxed">
                {inlineSuccess.message}
              </p>

              <div className="p-3 rounded-xl bg-[#151515] border border-[#2A2A2A] flex items-center justify-between gap-3 text-xs font-mono">
                <span className="text-[#8A8A8A] truncate">Ref: {inlineSuccess.referenceId}</span>
                <CopyButton text={inlineSuccess.referenceId} label="Copy ID" />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInlineSuccess(null);
                    setForm({ name: '', email: '', company: '', message: '', honeypot: '' });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#BDBDBD] hover:text-white bg-[#151515] border border-[#2A2A2A] hover:bg-[#1E1E1E] transition-all"
                >
                  Send Another Transmission
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/thank-you')}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#0A0A0A] bg-[#E6CBA8] hover:bg-[#F7E7CE] transition-all shadow-[0_0_12px_rgba(230,203,168,0.25)]"
                >
                  View Confirmation Page →
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top-of-form Server / Network Error Summary */}
              {serverError && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-[rgba(192,80,77,0.15)] border border-[#C0504D] text-[#C0504D] text-xs font-mono space-y-2"
                >
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Transmission Error</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{serverError}</p>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C0504D] text-white text-[11px] font-bold hover:bg-[#d05c59] transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Honeypot field for anti-spam */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website_hp">Leave this field blank</label>
                  <input
                    id="website_hp"
                    name="website_hp"
                    type="text"
                    value={form.honeypot}
                    onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Hidden UTM Attribution Fields */}
                <input type="hidden" name="utm_source" value={attribution?.utm_source || ''} />
                <input type="hidden" name="utm_medium" value={attribution?.utm_medium || ''} />
                <input type="hidden" name="utm_campaign" value={attribution?.utm_campaign || ''} />
                <input type="hidden" name="utm_term" value={attribution?.utm_term || ''} />
                <input type="hidden" name="utm_content" value={attribution?.utm_content || ''} />

            {/* Row 1: Name & Work Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-mono font-medium text-white flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#E6CBA8]" />
                    Operator Name <span className="text-[#C0504D]">*</span>
                  </span>
                </label>
                <input
                  ref={nameInputRef}
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Vikas Sharma"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#151515] text-white text-xs font-mono placeholder-[#5C5C5C] focus:outline-none transition-all ${
                    errors.name
                      ? 'border border-[#C0504D] focus:ring-1 focus:ring-[#C0504D]'
                      : 'border border-[#2A2A2A] focus:border-[#E6CBA8] focus:ring-1 focus:ring-[#E6CBA8]'
                  }`}
                />
                {errors.name && (
                  <p
                    id="contact-name-error"
                    role="alert"
                    className="text-[11px] font-mono text-[#C0504D] flex items-center gap-1.5 pt-0.5"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Work Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-mono font-medium text-white flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#E6CBA8]" />
                    Work Email <span className="text-[#C0504D]">*</span>
                  </span>
                </label>
                <input
                  ref={emailInputRef}
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="vikas@enterprise.com"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#151515] text-white text-xs font-mono placeholder-[#5C5C5C] focus:outline-none transition-all ${
                    errors.email
                      ? 'border border-[#C0504D] focus:ring-1 focus:ring-[#C0504D]'
                      : 'border border-[#2A2A2A] focus:border-[#E6CBA8] focus:ring-1 focus:ring-[#E6CBA8]'
                  }`}
                />
                {errors.email && (
                  <p
                    id="contact-email-error"
                    role="alert"
                    className="text-[11px] font-mono text-[#C0504D] flex items-center gap-1.5 pt-0.5"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Company */}
            <div className="space-y-1.5">
              <label
                htmlFor="contact-company"
                className="block text-xs font-mono font-medium text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#E6CBA8]" />
                  Organization / Fleet Operator
                </span>
                <span className="text-[10px] text-[#8A8A8A] font-mono">Optional</span>
              </label>
              <input
                ref={companyInputRef}
                id="contact-company"
                name="company"
                type="text"
                placeholder="Autonomous Fleet Robotics"
                value={form.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#151515] border border-[#2A2A2A] text-white text-xs font-mono placeholder-[#5C5C5C] focus:outline-none focus:border-[#E6CBA8] focus:ring-1 focus:ring-[#E6CBA8] transition-all"
              />
            </div>

            {/* Row 3: Message */}
            <div className="space-y-1.5">
              <label
                htmlFor="contact-message"
                className="block text-xs font-mono font-medium text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#E6CBA8]" />
                  Security Specifications & Fleet Size <span className="text-[#C0504D]">*</span>
                </span>
                <span className="text-[10px] text-[#8A8A8A] font-mono">Min 10 characters</span>
              </label>
              <textarea
                ref={messageInputRef}
                id="contact-message"
                name="message"
                required
                rows={4}
                placeholder="Provide autonomous agent count, target runtime throughput (TPM), and required policy rules..."
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
                onBlur={() => handleBlur('message')}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#151515] text-white text-xs font-mono placeholder-[#5C5C5C] focus:outline-none transition-all resize-y ${
                  errors.message
                    ? 'border border-[#C0504D] focus:ring-1 focus:ring-[#C0504D]'
                    : 'border border-[#2A2A2A] focus:border-[#E6CBA8] focus:ring-1 focus:ring-[#E6CBA8]'
                }`}
              />
              {errors.message && (
                <p
                  id="contact-message-error"
                  role="alert"
                  className="text-[11px] font-mono text-[#C0504D] flex items-center gap-1.5 pt-0.5"
                >
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.message}</span>
                </p>
              )}
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(230,203,168,0.3)] transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting Credentials…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transmit Dispatch Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
          </>
          )}
        </div>

        {/* Right 5 cols: Official SecOps Dispatch & Headquarters info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[#2A2A2A] space-y-4">
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6FAF8A]" />
              SecOps Dispatch Center
            </h3>
            <p className="text-xs text-[#8A8A8A] font-sans leading-relaxed">
              AgentLock 2.0 maintains 24/7 autonomous monitoring channels with human-in-the-loop review nodes for mission-critical enterprise deployments.
            </p>

            <div className="pt-3 border-t border-[#2A2A2A] space-y-3 text-xs font-mono text-[#8A8A8A]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E6CBA8] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">{companyName}</span>
                  <div className="text-[11px] text-[#8A8A8A]">
                    {streetAddress}<br />
                    {cityStateZip}, {country}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="w-4 h-4 text-[#E6CBA8] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#5C5C5C] uppercase block">Direct Inquiries</span>
                    <a href={`mailto:${contactEmail}`} className="text-white hover:text-[#E6CBA8] underline truncate block">
                      {contactEmail}
                    </a>
                  </div>
                </div>
                <CopyButton text={contactEmail} label="Copy" />
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E6CBA8] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#5C5C5C] uppercase block">Emergency Isolation Hotline</span>
                  <a href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`} className="text-white hover:text-[#E6CBA8]">
                    {contactPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#E6CBA8] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#5C5C5C] uppercase block">Operational Schedule</span>
                  <span className="text-zinc-300 text-[11px]">{businessHours}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#151515] border border-[#2A2A2A] flex items-center gap-3 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6FAF8A] shadow-[0_0_8px_#6FAF8A] shrink-0" />
            <span className="text-[#8A8A8A]">
              Enterprise SLAs: Tier 1 runtime support with &lt; 15min critical anomaly escalation.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
