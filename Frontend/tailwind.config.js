/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
    theme: {
      extend: {
        fontFamily: {
          heading: ["'Poppins'", 'sans-serif'],
          body: ["'Work Sans'", 'sans-serif'],
        },
        borderRadius: {
          small: '8px',
          large: '14px',
        },
        boxShadow: {
          custom: '0px 4px 24px rgba(99,102,241,0.10)',
          'custom-hover': '0px 8px 32px rgba(99,102,241,0.20)',
        },
        colors: {
          brand: {
            50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
            400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
            800: '#3730a3', 900: '#312e81',
          },
          accent: {
            50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc',
            400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf',
            800: '#86198f', 900: '#701a75',
          },
          amber: {
            50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
            400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
            800: '#92400e', 900: '#78350f',
          },
          purple: {
            50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
            400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce',
            800: '#6d28d9', 900: '#581c87',
          },
          gray: {
            50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db',
            400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151',
            800: '#1f2937', 900: '#111827',
          },
          red: {
            50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
            400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
            800: '#991b1b', 900: '#7f1d1d',
          },
          green: {
            50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
            400: '#4ade80', 500: '#22d3ee', 600: '#16a34a', 700: '#15803d',
            800: '#166534', 900: '#14532d',
          },
          orange: {
            50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
            400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
            800: '#9a3412', 900: '#7c2d12',
          },
        },
      },
    },
  plugins: [],
};
