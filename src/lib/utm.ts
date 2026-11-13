/**
 * UTM & Attribution Tracking Utility
 *
 * Allowed fields:
 * - utm_source
 * - utm_medium
 * - utm_campaign
 * - utm_term
 * - utm_content
 * - gclid
 * - fbclid
 * - referrer
 *
 * Rules:
 * 1. Read on first load.
 * 2. Sanitize and length-limit to max 100 characters per field.
 * 3. Store in memory for the current session.
 * 4. Only persist to sessionStorage/localStorage AFTER cookie consent.
 * 5. Strip UTM query parameters from visible URL using history.replaceState (preserving hash).
 */

const ALLOWED_FIELDS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
] as const;

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landing_page?: string;
  timestamp?: string;
}

const STORAGE_KEY_FIRST = 'agentlock_utm_first';
const STORAGE_KEY_LAST = 'agentlock_utm_last';
const CONSENT_KEY = 'agentlock_consent';

// In-memory fallback before consent is given
let inMemoryFirstTouch: AttributionData | null = null;
let inMemoryLastTouch: AttributionData | null = null;

function sanitizeParam(val: string | null): string | undefined {
  if (!val) return undefined;
  // Trim, remove dangerous chars, truncate to 100 chars
  const sanitized = val
    .trim()
    .replace(/[<>"'`\\]/g, '')
    .slice(0, 100);
  return sanitized.length > 0 ? sanitized : undefined;
}

export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed.analytics);
  } catch {
    return false;
  }
}

export function captureUTM(): AttributionData | null {
  if (typeof window === 'undefined') return null;

  try {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    const currentData: AttributionData = {
      timestamp: new Date().toISOString(),
      landing_page: window.location.pathname,
    };

    let hasUtm = false;
    ALLOWED_FIELDS.forEach((field) => {
      const val = searchParams.get(field);
      if (val) {
        const cleaned = sanitizeParam(val);
        if (cleaned) {
          currentData[field] = cleaned;
          hasUtm = true;
        }
      }
    });

    if (document.referrer && !document.referrer.includes(window.location.host)) {
      currentData.referrer = sanitizeParam(document.referrer);
    }

    if (hasUtm || currentData.referrer) {
      // Store in memory
      if (!inMemoryFirstTouch) {
        inMemoryFirstTouch = { ...currentData };
      }
      inMemoryLastTouch = { ...currentData };

      // If consent already granted, write to storage
      if (hasCookieConsent()) {
        persistUTMToStorage(currentData);
      }

      // Strip UTM params from visible URL but keep other params and hash
      ALLOWED_FIELDS.forEach((field) => searchParams.delete(field));
      const cleanSearch = searchParams.toString();
      const newUrl = `${window.location.pathname}${
        cleanSearch ? '?' + cleanSearch : ''
      }${window.location.hash}`;
      window.history.replaceState({}, document.title, newUrl);

      return currentData;
    }
  } catch (err) {
    console.error('Error capturing UTM parameters:', err);
  }

  return inMemoryLastTouch;
}

function persistUTMToStorage(data: AttributionData) {
  try {
    if (!localStorage.getItem(STORAGE_KEY_FIRST)) {
      localStorage.setItem(STORAGE_KEY_FIRST, JSON.stringify(data));
    }
    localStorage.setItem(STORAGE_KEY_LAST, JSON.stringify(data));
    sessionStorage.setItem(STORAGE_KEY_LAST, JSON.stringify(data));
  } catch {
    // Ignore storage quota / incognito errors
  }
}

export function onConsentGranted() {
  if (inMemoryLastTouch) {
    persistUTMToStorage(inMemoryLastTouch);
  }
}

export function getStoredAttribution(): {
  firstTouch: AttributionData | null;
  lastTouch: AttributionData | null;
} {
  if (typeof window === 'undefined') {
    return { firstTouch: null, lastTouch: null };
  }

  let first: AttributionData | null = inMemoryFirstTouch;
  let last: AttributionData | null = inMemoryLastTouch;

  if (hasCookieConsent()) {
    try {
      const storedFirst = localStorage.getItem(STORAGE_KEY_FIRST);
      const storedLast = localStorage.getItem(STORAGE_KEY_LAST);
      if (storedFirst) first = JSON.parse(storedFirst);
      if (storedLast) last = JSON.parse(storedLast);
    } catch {
      // Fallback to memory
    }
  }

  return { firstTouch: first, lastTouch: last };
}
