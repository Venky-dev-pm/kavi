/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './blog/*.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      colors: {
        sage: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
        kavi: {
          cyan: '#38BDF8',
          gold: '#FBBF24',
          purple: '#a78bfa',
          bg: '#050508',
          surface: '#0f172a',
          card: '#131c2e',
          border: 'rgba(255,255,255,0.06)'
        }
      }
    }
  }
};
