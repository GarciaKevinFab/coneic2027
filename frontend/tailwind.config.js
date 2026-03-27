/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8EDF5',
          100: '#C5D0E6',
          200: '#9FB3D6',
          300: '#7895C5',
          400: '#5B7FB8',
          500: '#3E69AB',
          600: '#1A3A6B',
          700: '#152F57',
          800: '#102443',
          900: '#0B192F',
          DEFAULT: '#1A3A6B',
        },
        accent: {
          50: '#FEF5E7',
          100: '#FDE6BF',
          200: '#FBD594',
          300: '#F9C468',
          400: '#F7B847',
          500: '#F4A524',
          600: '#E0911A',
          700: '#C47C14',
          800: '#A8680F',
          900: '#7A4C0A',
          DEFAULT: '#F4A524',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
