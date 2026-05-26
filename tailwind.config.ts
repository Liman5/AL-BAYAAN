import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './features/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edf6ec',
          100: '#dfeedd',
          500: '#3f7a44',
          700: '#1f4222'
        },
        accent: {
          50: '#fff4e1',
          500: '#c69b2a',
          700: '#8f6d1f'
        }
      }
    }
  },
  plugins: []
};

export default config;
