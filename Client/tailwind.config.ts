import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#E6F1FB',
          100: '#B5D4F4',
          500: '#378ADD',
          600: '#185FA5',
          700: '#0C447C',
          900: '#042C53',
        },
      },
    },
  },
  plugins: [],
}

export default config
