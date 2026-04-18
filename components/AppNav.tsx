'use client';

import { useRouter } from 'next/navigation';

export default function AppNav() {
  const router = useRouter();

  const colors = {
    bg: '#050505',
    border: '#1a1a1a',
    text: '#ffffff',
    textMuted: '#666666',
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: `1px solid ${colors.border}`,
      background: colors.bg,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div
        onClick={() => router.push('/')}
        style={{
          fontSize: '18px',
          fontWeight: '800',
          letterSpacing: '2px',
          cursor: 'pointer',
          color: colors.text,
        }}
      >
        SCANMYCREDS
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={() => router.push('/app/dashboard')}
          style={{
            background: '#1a1a1a',
            border: 'none',
            color: colors.text,
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => router.push('/app/scanner')}
          style={{
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            color: colors.textMuted,
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Scanner
        </button>
        <button
          onClick={() => router.push('/app/history')}
          style={{
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            color: colors.textMuted,
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          History
        </button>
        <button
          onClick={() => router.push('/app/tools')}
          style={{
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            color: colors.textMuted,
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Tools
        </button>
        <button
          onClick={() => router.push('/app/phone-scanner')}
          style={{
            background: 'transparent',
            border: `1px solid #6c9ef7`,
            color: '#6c9ef7',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          📱 Phone
        </button>
      </div>
    </nav>
  );
}
