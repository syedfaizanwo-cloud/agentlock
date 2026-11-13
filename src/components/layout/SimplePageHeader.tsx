import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

const Link = ({ href, children, ...props }: any) => (
  <a href={href} {...props}>
    {children}
  </a>
);

interface SimplePageHeaderProps {
  currentLabel?: string;
}

export const SimplePageHeader: React.FC<SimplePageHeaderProps> = ({ currentLabel }) => {
  return (
    <header className="w-full border-b border-[#2A2A2A] bg-[#0D0D0D]/90 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3 text-white group" aria-label="AgentLock 2.0 Home">
          <div className="w-9 h-9 rounded-xl bg-[#E6CBA8] text-[#0A0A0A] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(230,203,168,0.3)] transition-transform group-hover:scale-105">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-lg tracking-tight text-white">
              AgentLock <span className="text-[#E6CBA8]">2.0</span>
            </span>
            {currentLabel && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-[rgba(230,203,168,0.12)] border border-[#B89B72]/40 text-[#E6CBA8]">
                {currentLabel}
              </span>
            )}
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-[#BDBDBD] hover:text-white bg-[#151515] border border-[#2A2A2A] hover:border-[#E6CBA8] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#E6CBA8]" />
          <span>Back to AgentLock 2.0</span>
        </Link>
      </div>
    </header>
  );
};
