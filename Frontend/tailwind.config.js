export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
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
      },
    },
  },
  plugins: [],
}
