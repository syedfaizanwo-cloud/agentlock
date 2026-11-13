'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface ScrollPopContextType {
  activeSection: string | null;
  registerSection: (el: HTMLElement | null, id: string) => () => void;
}

const ScrollPopContext = createContext<ScrollPopContextType>({
  activeSection: null,
  registerSection: () => () => {},
});

export const useScrollPop = () => useContext(ScrollPopContext);

export const ScrollPopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const elementsRef = useRef<Map<HTMLElement, { id: string; timer?: NodeJS.Timeout }>>(new Map());
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'down' | 'up'>('down');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track scroll direction cleanly via rAF / passive scroll
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (Math.abs(currentY - lastScrollY.current) > 4) {
            scrollDirection.current = currentY > lastScrollY.current ? 'down' : 'up';
            lastScrollY.current = currentY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Single shared IntersectionObserver with threshold [0, 0.18] and rootMargin -8%
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const meta = elementsRef.current.get(target);
          if (!meta) return;

          // Set scroll direction attribute on target
          target.setAttribute('data-direction', scrollDirection.current);

          if (entry.isIntersecting && entry.intersectionRatio >= 0.14) {
            // Section entered view
            if (meta.timer) {
              clearTimeout(meta.timer);
              meta.timer = undefined;
            }
            target.setAttribute('data-in', 'true');
            setActiveSection(meta.id);

            // Re-apply stagger delay to any new/dynamic children
            const reveals = target.querySelectorAll('[data-reveal]');
            reveals.forEach((child, index) => {
              const htmlChild = child as HTMLElement;
              if (!htmlChild.style.getPropertyValue('--d')) {
                htmlChild.style.setProperty('--d', `${Math.min(index * 70, 770)}ms`);
              }
            });

            // Dispatch event for child charts & counters to replay
            target.dispatchEvent(new CustomEvent('section-pop-in', { bubbles: true, detail: { id: meta.id } }));
          } else if (!entry.isIntersecting || entry.intersectionRatio <= 0.02) {
            // Section leaving view: apply 150ms hysteresis timeout to prevent rapid flicker
            if (meta.timer) clearTimeout(meta.timer);
            meta.timer = setTimeout(() => {
              target.setAttribute('data-in', 'false');
              target.dispatchEvent(new CustomEvent('section-pop-out', { bubbles: true, detail: { id: meta.id } }));
            }, 150);
          }
        });
      },
      {
        threshold: [0, 0.18],
        rootMargin: '0px 0px -8% 0px',
      }
    );

    // Attach registered elements
    elementsRef.current.forEach((_, el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observerRef.current?.disconnect();
      elementsRef.current.forEach((meta) => {
        if (meta.timer) clearTimeout(meta.timer);
      });
      elementsRef.current.clear();
    };
  }, []);

  const registerSection = (el: HTMLElement | null, id: string) => {
    if (!el) return () => {};

    // Initial state: if hero and at top of page, initialize to data-in="true"
    const isHero = id === 'hero';
    const isAtTop = typeof window !== 'undefined' && window.scrollY < 200;
    el.setAttribute('data-section', id);
    el.setAttribute('data-in', isHero && isAtTop ? 'true' : 'false');
    el.setAttribute('data-direction', 'down');

    // Auto-stagger direct [data-reveal] children with 70ms step, max 12
    const reveals = el.querySelectorAll('[data-reveal]');
    reveals.forEach((child, index) => {
      const htmlChild = child as HTMLElement;
      htmlChild.style.setProperty('--d', `${Math.min(index * 70, 770)}ms`);
      if (index >= 12) {
        htmlChild.classList.add('fade-only');
      }
    });

    elementsRef.current.set(el, { id });
    observerRef.current?.observe(el);

    return () => {
      observerRef.current?.unobserve(el);
      elementsRef.current.delete(el);
    };
  };

  return (
    <ScrollPopContext.Provider value={{ activeSection, registerSection }}>
      {children}
    </ScrollPopContext.Provider>
  );
};

interface PopSectionProps extends React.HTMLAttributes<HTMLElement> {
  id: string;
  variant?: 'up' | 'up-left' | 'up-right' | 'scale-in';
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

export const PopSection: React.FC<PopSectionProps> = ({
  id,
  variant = 'up',
  as: Component = 'section',
  className = '',
  children,
  ...props
}) => {
  const { registerSection } = useScrollPop();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const unregister = registerSection(ref.current, id);
    return unregister;
  }, [id, registerSection]);

  const variantClass =
    variant === 'up-left'
      ? 'data-[variant=up-left]'
      : variant === 'up-right'
      ? 'data-[variant=up-right]'
      : variant === 'scale-in'
      ? 'data-[variant=scale-in]'
      : 'data-[variant=up]';

  return (
    <Component
      ref={ref}
      id={id}
      data-variant={variant}
      className={`scroll-mt-8 cv-auto ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
