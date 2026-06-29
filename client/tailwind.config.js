/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0B6E4F',
        secondary: '#17A589',
        accent: '#F4A261',
        danger: '#E63946',
        success: '#2DC653',
        warning: '#F4A261',
        bgLight: '#F0FAF6',
        gray1: '#F5F5F5',
        gray2: '#D9D9D9',
        gray3: '#6B7280',
      },
    },
  },
  plugins: [],
}
