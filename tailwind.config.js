// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Text', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'monospace'],
      },
      colors: {
        primary: '#0066CC',
        background: {
          light: '#F5F5F7',
          DEFAULT: '#FFFFFF',
        },
        text: {
          primary: '#000000',
          secondary: '#86868B',
        },
        success: '#00B300',
        warning: '#FF9F0A',
        error: '#FF3B30',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
