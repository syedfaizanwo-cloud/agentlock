import React from 'react';
import { Shield } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-[#050505] text-[#FFFFFF] z-50"
      role="status"
      aria-label="Loading AgentLock 2.0"
    >
      <div className="w-12 h-12 rounded-xl bg-[#E6CBA8] text-[#0A0A0A] flex items-center justify-center font-bold shadow-[0_0_20px_rgba(230,203,168,0.35)] animate-pulse">
        <Shield className="w-6 h-6 fill-current" />
      </div>
      <span className="text-xs font-mono text-[#8A8A8A] uppercase tracking-widest">
        Loading Command Mesh...
      </span>
    </div>
  );
}
