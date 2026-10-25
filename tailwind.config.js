/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#060911',
          900: '#0B101D',
          850: '#0F172A',
          800: '#141E34',
          750: '#1A2744',
          700: '#223254',
          600: '#324773',
          500: '#486298',
          400: '#6882BE',
          300: '#94A7DD',
          200: '#C7D3F3',
          100: '#E8EDFC',
        },
        aeroblue: {
          DEFAULT: '#0EA5E9',
          light: '#38BDF8',
          dark: '#0284C7',
          glow: 'rgba(14, 165, 233, 0.25)',
        },
        aerogreen: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        aeroamber: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        aerored: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        aeroindigo: {
          DEFAULT: '#6366F1',
          light: '#818CF8',
          dark: '#4F46E5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(rgba(56, 189, 248, 0.12) 1px, transparent 1px)",
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit-rotate': 'spin 60s linear infinite',
      }
    },
  },
  plugins: [],
};
