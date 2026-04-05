import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Industrial dark theme base
        surface: {
          base:   '#080C18',
          raised: '#0D1526',
          panel:  '#111827',
          card:   '#161F35',
          border: '#1E2D4A',
          hover:  '#1A2540',
        },
        // Brand amber
        brand: {
          DEFAULT: '#F59E0B',
          dim:     '#B45309',
          glow:    '#FCD34D',
        },
        // Status palette
        status: {
          draft:       '#64748B',
          submitted:   '#3B82F6',
          review:      '#EAB308',
          approved:    '#22C55E',
          active:      '#10B981',
          suspended:   '#F97316',
          cancelled:   '#EF4444',
          closed:      '#6B7280',
          expired:     '#9CA3AF',
          rejected:    '#DC2626',
          revalidate:  '#A855F7',
          transferred: '#8B5CF6',
          archived:    '#374151',
        },
        // Gas / safety
        gas: {
          safe:    '#10B981',
          warning: '#F59E0B',
          danger:  '#EF4444',
          unknown: '#6B7280',
        },
        // Risk levels
        risk: {
          low:      '#22C55E',
          medium:   '#EAB308',
          high:     '#F97316',
          critical: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Barlow', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        card:    '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
        panel:   '0 4px 6px rgba(0,0,0,0.4)',
        glow:    '0 0 12px rgba(245,158,11,0.3)',
        danger:  '0 0 12px rgba(239,68,68,0.4)',
        success: '0 0 12px rgba(16,185,129,0.3)',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'blink-alert': 'blink 1s step-end infinite',
        'slide-in':    'slideIn 0.2s ease-out',
        'fade-in':     'fadeIn 0.15s ease-out',
      },
      keyframes: {
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        fadeIn:  { from: { opacity: '0', transform: 'translateY(-4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
