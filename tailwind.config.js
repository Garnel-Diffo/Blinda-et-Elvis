/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sky-wed': {
          light: '#BAE6FD',
          DEFAULT: '#0EA5E9',
          dark: '#0284C7',
        },
        'gold-wed': {
          light: '#FDE68A',
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        'cream': '#FDF8F0',
        'sage': '#10B981',
        'petal': '#FB7185',
        'wed-dark': '#1E1B4B',
        'wed-text': '#374151',
      },
      fontFamily: {
        script: ['"Great Vibes"', 'cursive'],
        heading: ['"Cormorant Garamond"', 'serif'],
        body: ['Lato', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(253,248,240,0.92) 50%, rgba(245,158,11,0.15) 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.4) 50%, transparent 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.2)',
        'sky-glow': '0 0 30px rgba(14,165,233,0.4), 0 0 60px rgba(14,165,233,0.2)',
        'soft': '0 4px 40px rgba(0,0,0,0.08)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-22px) rotate(6deg)' },
        },
        petalFall: {
          '0%': { transform: 'translateY(-50px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.2)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.12)' },
          '70%': { transform: 'scale(1)' },
        },
        goldShimmer: {
          '0%': { backgroundPosition: '-300px 0' },
          '100%': { backgroundPosition: '300px 0' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          '25%': { opacity: '0.6', transform: 'scale(0.8) rotate(45deg)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(90deg)' },
          '75%': { opacity: '0.8', transform: 'scale(0.9) rotate(135deg)' },
        },
        pulse2: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,158,11,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(245,158,11,0)' },
        },
        gradientFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 20px rgba(245,158,11,0.5), 0 0 40px rgba(245,158,11,0.2)' },
          '50%': { textShadow: '0 0 30px rgba(245,158,11,0.8), 0 0 60px rgba(245,158,11,0.4), 0 0 90px rgba(245,158,11,0.2)' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.08) translate(-2%, -1%)' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'petal-fall': 'petalFall 10s linear infinite',
        heartbeat: 'heartbeat 2s ease-in-out infinite',
        'gold-shimmer': 'goldShimmer 2.5s infinite linear',
        sparkle: 'sparkle 3s ease-in-out infinite',
        'pulse-gold': 'pulse2 2s ease-in-out infinite',
        'gradient-flow': 'gradientFlow 4s ease infinite',
        'fade-slide-up': 'fadeSlideUp 0.8s ease-out forwards',
        glow: 'glow 2.5s ease-in-out infinite',
        'ken-burns': 'kenBurns 12s ease-in-out alternate infinite',
      },
    },
  },
  plugins: [],
}
