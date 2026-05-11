/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0071E3',
          light: '#0A84FF',
          dark: '#0056B3'
        },
        surface: {
          light: '#F5F5F7',
          dark: '#000000',
          elevated: {
            light: '#FFFFFF',
            dark: '#1C1C1E'
          }
        },
        text: {
          primary: {
            light: '#1D1D1F',
            dark: '#F5F5F7'
          },
          secondary: {
            light: '#86868B',
            dark: '#98989D'
          }
        },
        success: {
          light: '#34C759',
          dark: '#30D158'
        },
        warning: {
          light: '#FF9500',
          dark: '#FF9F0A'
        },
        error: {
          light: '#FF3B30',
          dark: '#FF453A'
        },
        border: {
          light: '#D2D2D7',
          dark: '#38383A'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        'apple-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'apple-md': '0 8px 24px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
        'apple-lg': '0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'apple-xl': '0 30px 60px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04)'
      },
      borderRadius: {
        'apple-sm': '0.5rem',
        'apple-md': '0.75rem',
        'apple-lg': '1rem',
        'apple-xl': '1.5rem'
      },
      backdropBlur: {
        'apple': '20px'
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}