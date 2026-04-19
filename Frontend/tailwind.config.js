/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F4F6F9',
        foreground: '#0F172A',
        primary: {
          DEFAULT: '#0F172A',
          foreground: '#F8FAFC',
        },
        accent: {
          DEFAULT: '#F97316',
          foreground: '#FFFFFF',
        },
        secondary: '#E9EEF5',
        muted: '#F1F5F9',
        'muted-foreground': '#64748B',
        destructive: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
        info: '#3B82F6',
        border: '#E2E8F0',
        card: '#FFFFFF',
      },
    },
  },
  plugins: [],
}