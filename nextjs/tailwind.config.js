/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        text: 'hsl(var(--text))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        vibrant: {
          DEFAULT: 'hsl(var(--vibrant))',
          foreground: 'hsl(var(--vibrant-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        'brand-blue': 'hsl(var(--brand-blue))',
        'brand-blue-hex': '#65c3fc',
        'brand-green': 'hsl(var(--brand-green))',
        'brand-pink': 'hsl(var(--brand-pink))',
        'brand-yellow': 'hsl(var(--brand-yellow))',
        'scrollbar-track-light': 'hsl(var(--scrollbar-track-light))',
        'scrollbar-thumb-light': 'hsl(var(--scrollbar-thumb-light))',
        'scrollbar-track-dark': 'hsl(var(--scrollbar-track-dark))',
        'scrollbar-thumb-dark': 'hsl(var(--scrollbar-thumb-dark))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      height: {
        'vh-minus-navbar': 'calc(100vh - 57px)', // Custom height class
        'navbar-height': '57px',
      },
      minWidth: {
        'sidebar-collapsed': '',
        'sidebar-expanded': '230px'
      },
      width: {
        'w-fill-available': [
          '-webkit-fill-available',
          '-moz-available',
          'stretch',
          'fill-available'
        ]
      }
    }
  },
  plugins: [
    require('tailwind-scrollbar'),
    require('tailwindcss-animate'),
    function({ addUtilities }) {
      addUtilities({
        '.w-fill-available': {
          width: '-webkit-fill-available',
          width: '-moz-available',
          width: 'stretch',
          width: 'fill-available',
        },
      })
    }
  ],
  variants: {
    scrollbar: ['dark'],
    extend: {
      scrollbar: ['dark'],
    }
  }
};
