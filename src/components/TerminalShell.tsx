/**
 * Terminal Shell Layout
 * Left nav + main content area for all terminal pages
 */
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LeftNav } from '@/components/LeftNav';

interface TerminalShellProps {
  children: React.ReactNode;
}

const T = {
  bg0: '#0C0E12',
  brand: '#2962FF',
  border0: 'rgba(255,255,255,0.06)',
  text0: '#FFFFFF',
  text3: '#50535E',
};

export function TerminalShell({ children }: TerminalShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: T.bg0,
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Desktop sidebar */}
      <div style={{ display: 'flex', height: '100%' }} className="hidden lg:flex">
        <LeftNav />
      </div>

      {/* Mobile overlay nav */}
      {mobileNavOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            style={{ height: '100%', width: 'max-content' }}
            onClick={(e) => e.stopPropagation()}
          >
            <LeftNav onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Mobile header bar */}
        <div className="lg:hidden" style={{
          height: '44px',
          background: '#131722',
          borderBottom: `1px solid ${T.border0}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '10px',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setMobileNavOpen(true)}
            style={{
              background: 'transparent', border: 'none',
              color: T.text0, cursor: 'pointer', padding: '4px',
              display: 'flex', alignItems: 'center',
            }}
          >
            <Menu size={18} />
          </button>
          <div style={{
            fontSize: '12px', fontWeight: 800, color: T.text0,
            fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.5px',
          }}>
            QUANTARA MARKETS
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
