/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          cream: {
            bg: '#FAF7EE',
            card: '#F4EFE0',
            text: '#24211D',
            border: '#E3DBC7',
            accent: '#4C6B5B',
          },
          mint: {
            bg: '#F0F7F4',
            card: '#E2F0EA',
            text: '#1C2C24',
            border: '#C3E1D4',
            accent: '#2D7254',
          },
          lavender: {
            bg: '#F6F4FB',
            card: '#ECE7F6',
            text: '#221A30',
            border: '#D8CEEC',
            accent: '#624694',
          },
          slate: {
            bg: '#181E24',
            card: '#222B34',
            text: '#E2E8F0',
            border: '#334155',
            accent: '#38BDF8',
          },
          paper: {
            bg: '#FDFBF7',
            card: '#F6F2EA',
            text: '#1F2937',
            border: '#E5E0D4',
            accent: '#2563EB',
          }
        }
      },
      fontFamily: {
        dyslexic: ['"OpenDyslexic"', 'sans-serif'],
        lexend: ['"Lexend"', 'sans-serif'],
        atkinson: ['"Atkinson Hyperlegible"', 'sans-serif'],
        comic: ['"Comic Neue"', 'cursive', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
