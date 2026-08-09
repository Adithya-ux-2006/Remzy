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
        border: "hsl(var(--border))",
        "border-subtle": "hsl(var(--border-subtle))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: "hsl(152 40% 22%)",
          light: "hsl(152 35% 88%)",
          tint: "hsl(var(--primary-tint))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          tint: "hsl(var(--accent-tint))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        modal: {
          DEFAULT: "hsl(var(--modal))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        ink: {
          DEFAULT: 'hsl(var(--ink))',
          muted: 'hsl(var(--ink-muted))',
          subtle: 'hsl(var(--ink-subtle))',
        },
        bg: {
          DEFAULT: 'hsl(var(--background))',
          dark: 'hsl(var(--background))',
        },
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          raised: 'hsl(var(--surface-raised))',
          light: 'hsl(var(--surface))',
          dark: 'hsl(var(--surface))',
        },
        mint: { DEFAULT: 'hsl(var(--mint))' },
        warm: { DEFAULT: '#F4A261', light: '#FBD3A8', dark: '#E08838' },
        forest: { DEFAULT: '#2F6E52', light: '#4A7263' },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
          light: 'hsl(var(--danger-soft))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          light: 'hsl(var(--warning-soft))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          light: 'hsl(var(--success-soft))',
        },
        evidence: {
          DEFAULT: 'hsl(var(--evidence))',
          light: 'hsl(var(--evidence-soft))',
        },
        kaggle: {
          DEFAULT: '#20BEFF',
        },
        rating: {
          DEFAULT: 'hsl(var(--color-rating-star))',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'card': 'var(--radius-card)',
        'pill': 'var(--radius-pill)',
      },
      boxShadow: {
        'soft': '0 2px 12px hsl(var(--shadow-color) / 0.04)',
        'soft-lg': '0 4px 24px hsl(var(--shadow-color) / 0.06)',
        'card': 'var(--shadow-card)',
        'card-lg': 'var(--shadow-card-lg)',
        'card-hover': '0 8px 30px hsl(var(--shadow-color) / 0.1)',
        'glow': '0 4px 24px hsl(var(--primary) / 0.3)',
        'glass': '0 8px 32px hsl(var(--shadow-color) / 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.08', letterSpacing: '-0.03em' }],
        'heading': ['1.75rem', { lineHeight: '1.25', fontWeight: '600' }],
        'section-heading': ['1.375rem', { lineHeight: '1.35', fontWeight: '700' }],
        'body': ['1rem', { lineHeight: '1.5' }],
        'caption': ['0.875rem', { lineHeight: '1.5' }],
        'metadata': ['0.75rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--background)) 100%)',
        'gradient-featured': 'linear-gradient(135deg, hsl(var(--primary) / 0.3) 0%, hsl(var(--primary) / 0.15) 100%)',
        'gradient-hero': 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--accent)) 100%)',
        'gradient-mint': 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--background)) 100%)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: ["tailwindcss-animate"],
}
