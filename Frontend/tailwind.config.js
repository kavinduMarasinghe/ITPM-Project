export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e293b',
        "primary-foreground": '#f1f5f9',
        accent: '#f97316',
        "accent-foreground": '#ffffff',
        secondary: '#64748b',
        "secondary-foreground": '#ffffff',
        destructive: '#ef4444',
        "destructive-foreground": '#ffffff',
        muted: '#f1f5f9',
        "muted-foreground": '#94a3b8',
        border: '#e2e8f0',
        background: '#ffffff',
        foreground: '#1e293b',
        success: '#22c55e',
        warning: '#eab308',
        info: '#06b6d4',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
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
}
