'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Mail, Phone, MapPin, Clock, Cookie } from 'lucide-react';
import { LAST_UPDATED_ISO, LAST_UPDATED_FORMATTED } from '../../lib/last-updated';

interface SiteFooterProps {
  onOpenCookieSettings?: () => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ onOpenCookieSettings }) => {
  // CONFIG placeholders per user specification
  // TODO: Replace with live production address and registered legal entity when available
  const companyName = 'AgentLock Cybernetics Inc.';
  const streetAddress = '100 Montgomery St, Suite 1800';
  const cityStateZip = 'San Francisco, CA 94104';
  const country = 'United States';
  const contactEmail = 'security@agentlock.ai';
  const contactPhone = '+1 (415) 890-5625';
  const businessHours = 'Mon - Fri: 08:00 - 18:00 PST // 24/7 SecOps Dispatch';

  return (
    <footer className="w-full bg-[#0D0D0D] border-t border-[#2A2A2A] text-xs font-mono text-[#8A8A8A] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 text-white group">
              <div className="w-8 h-8 rounded-lg bg-[#E6CBA8] text-[#0A0A0A] flex items-center justify-center font-bold shadow-[0_0_12px_rgba(230,203,168,0.3)] transition-transform group-hover:scale-105">
                <Shield className="w-4 h-4 fill-current" />
              </div>
              <span className="font-sans font-bold text-base tracking-tight">
                AgentLock <span className="text-[#E6CBA8]">2.0</span>
              </span>
            </Link>
            <p className="text-xs text-[#8A8A8A] leading-relaxed font-sans">
              Deterministic Zero-Trust Runtime Gateway for AI Fleets. Real-time multi-vector policy enforcement, forensic dossiers, and immutable cryptographic audit logging.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-[rgba(230,203,168,0.12)] border border-[#B89B72]/40 text-[#E6CBA8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6FAF8A] animate-pulse" />
                SOC2 Type II & ISO 27001 Ready
              </span>
            </div>
          </div>

          {/* Col 2: Navigation & Legal */}
          <div className="space-y-3">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider font-sans">
              Gateway Architecture
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#telemetry" className="hover:text-[#E6CBA8] transition-colors">
                  Live Fleet Telemetry
                </Link>
              </li>
              <li>
                <Link href="/#flow" className="hover:text-[#E6CBA8] transition-colors">
                  Flowing Options Navigation
                </Link>
              </li>
              <li>
                <Link href="/#fleet-governance" className="hover:text-[#E6CBA8] transition-colors">
                  Fleet Governance & Quotas
                </Link>
              </li>
              <li>
                <Link href="/#threat-forensics" className="hover:text-[#E6CBA8] transition-colors">
                  MITRE Forensic Dossiers
                </Link>
              </li>
              <li>
                <Link href="/#approval-center" className="hover:text-[#E6CBA8] transition-colors">
                  HITL Approval Queue
                </Link>
              </li>
              <li>
                <Link href="/#gateway-api" className="hover:text-[#E6CBA8] transition-colors">
                  FastAPI Sync & Schema
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-[#E6CBA8] transition-colors">
                  Source & Destination Security
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[#E6CBA8] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Privacy Links */}
          <div className="space-y-3">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider font-sans">
              Security & Policies
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-[#E6CBA8] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#E6CBA8] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCookieSettings) {
                      onOpenCookieSettings();
                    } else if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-cookie-settings'));
                    }
                  }}
                  className="inline-flex items-center gap-1.5 hover:text-[#E6CBA8] transition-colors text-left"
                >
                  <Cookie className="w-3.5 h-3.5 text-[#E6CBA8]" />
                  <span>Cookie Settings</span>
                </button>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-[#E6CBA8] transition-colors">
                  Contact Incident Response
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Real Headquarters & SecOps Dispatch */}
          <div className="space-y-3">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider font-sans">
              Headquarters & Dispatch
            </h3>
            <div className="space-y-2.5 text-xs text-[#8A8A8A]">
              <div className="text-white font-medium">{companyName}</div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E6CBA8] shrink-0 mt-0.5" />
                <span>
                  {streetAddress}<br />
                  {cityStateZip}, {country}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E6CBA8] shrink-0" />
                <a href={`mailto:${contactEmail}`} className="text-[#BDBDBD] hover:text-[#E6CBA8] transition-colors underline">
                  {contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E6CBA8] shrink-0" />
                <a href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`} className="text-[#BDBDBD] hover:text-[#E6CBA8] transition-colors">
                  {contactPhone}
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-3.5 h-3.5 text-[#E6CBA8] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">{businessHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom divider & copyright */}
        <div className="mt-12 pt-8 border-t border-[#2A2A2A] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} {companyName}. All rights reserved. Zero-Trust Runtime Gateway for AI Fleets.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[#8A8A8A]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>•</span>
            <span>
              Last updated: <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED_FORMATTED}</time>
            </span>
            <span>•</span>
            <span className="text-[#E6CBA8]">SHA-256 Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
