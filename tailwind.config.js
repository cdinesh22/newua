/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12'
        },
        india: {
          saffron: '#FF9933', // deeper saffron for accents
          white: '#FFFFFF',
          green: '#138808', // India green
          navy: '#003366',  // supportive navy for text/links
        },
        indiaGreen: {
          50: '#E8F5EA',
          100: '#CDEBD2',
          200: '#9CDAA8',
          300: '#6CC97E',
          400: '#3BB854',
          500: '#138808',
          600: '#0F6D07',
          700: '#0B5205',
          800: '#073804',
          900: '#041F02',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'fade-in': 'fadeIn .6s ease-out both',
        'slide-up': 'slideUp .5s ease-out both',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s linear infinite'
      }
    }
  },
  plugins: [],
}
