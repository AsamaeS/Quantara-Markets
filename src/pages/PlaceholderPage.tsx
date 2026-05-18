/**
 * Placeholder page for unimplemented routes
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

const T = {
  bg0: '#0C0E12', bg1: '#131722', bg2: '#1E222D',
  border0: 'rgba(255,255,255,0.06)',
  brand: '#2962FF', brandLt: '#5B8DEF',
  text0: '#FFFFFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  warn: '#FF9800',
};

export default function PlaceholderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pageName = location.pathname.replace(/\//g, ' ').trim().toUpperCase() || 'PAGE';

  return (
    <div style={{
      height: '100%',
      background: T.bg0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: T.bg1,
        border: `1px solid ${T.border0}`,
        borderRadius: '10px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '440px',
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'rgba(255,152,0,0.12)', border: '1px solid rgba(255,152,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Construction size={22} color={T.warn} />
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px', fontWeight: 700, color: T.text3,
          letterSpacing: '1.5px', textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          {pageName}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: T.text0, marginBottom: '8px' }}>
          Module Under Construction
        </div>
        <div style={{ fontSize: '12px', color: T.text2, lineHeight: 1.65, marginBottom: '24px' }}>
          This module is part of the Quantara Markets roadmap and will be available in a future sprint.
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: T.brand, border: 'none', borderRadius: '4px',
              padding: '8px 16px', color: '#fff', fontSize: '11px',
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/ai-committee')}
            style={{
              background: 'transparent', border: `1px solid ${T.border0}`,
              borderRadius: '4px', padding: '8px 16px', color: T.text1,
              fontSize: '11px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            AI Committee
          </button>
        </div>
      </div>
    </div>
  );
}
