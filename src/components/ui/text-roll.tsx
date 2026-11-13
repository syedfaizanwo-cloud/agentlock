import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface TextRollProps {
  children: string;
  className?: string;
  hoverClassName?: string;
  active?: boolean;
  stagger?: number;
  duration?: number;
  as?: React.ElementType;
}

const TRANSITION_EASE = [0.4, 0, 0.2, 1]; // Custom slow-in slow-out cubic-bezier

export default function TextRoll({
  children,
  className = '',
  hoverClassName = 'text-coral',
  active = false,
  stagger = 0.02,
  duration = 0.22,
  as: Component = 'span',
}: TextRollProps) {
  const [isInteracting, setIsInteracting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const isTriggered = active || isInteracting;
  const text = typeof children === 'string' ? children : String(children || '');
  const characters = text.split('');
  const centerIndex = (characters.length - 1) / 2;

  // Reduced motion: instant simple color change without layout transform
  if (shouldReduceMotion) {
    return (
      <Component
        className={`inline-block transition-colors duration-150 ${isTriggered ? hoverClassName : className}`}
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
        onFocus={() => setIsInteracting(true)}
        onBlur={() => setIsInteracting(false)}
        onTouchStart={() => setIsInteracting(true)}
        onTouchEnd={() => setIsInteracting(false)}
        aria-label={text}
      >
        <span aria-hidden="true">{text}</span>
      </Component>
    );
  }

  return (
    <Component
      className={`inline-flex items-center select-none ${className}`}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocus={() => setIsInteracting(true)}
      onBlur={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => setIsInteracting(false)}
      aria-label={text}
    >
      <span className="inline-flex overflow-hidden" aria-hidden="true">
        {characters.map((char, i) => {
          const distFromCenter = Math.abs(i - centerIndex);
          const delay = distFromCenter * stagger;
          const displayChar = char === ' ' ? '\u00A0' : char;

          return (
            <span
              key={i}
              className="relative inline-block overflow-hidden leading-tight h-[1.15em]"
              style={{ whiteSpace: 'pre' }}
            >
              {/* Outgoing Letter */}
              <motion.span
                className="block"
                initial={false}
                animate={{
                  y: isTriggered ? '-100%' : '0%',
                  opacity: isTriggered ? 0.2 : 1,
                }}
                transition={{
                  duration,
                  delay,
                  ease: TRANSITION_EASE,
                }}
              >
                {displayChar}
              </motion.span>

              {/* Incoming Letter (Coral) */}
              <motion.span
                className={`absolute inset-0 block ${hoverClassName}`}
                initial={false}
                animate={{
                  y: isTriggered ? '0%' : '100%',
                  opacity: isTriggered ? 1 : 0.2,
                }}
                transition={{
                  duration,
                  delay,
                  ease: TRANSITION_EASE,
                }}
              >
                {displayChar}
              </motion.span>
            </span>
          );
        })}
      </span>
    </Component>
  );
}
