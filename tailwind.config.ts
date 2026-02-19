import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(26, 31, 58)', // #1a1f3a
        secondary: 'rgb(34, 211, 238)', // #22d3ee
        accent: 'rgb(16, 185, 129)', // #10b981
        'text-muted': 'rgb(160, 174, 192)', // #a0aec0
        'border-color': 'rgb(45, 55, 72)', // #2d3748
        'bg-card': 'rgba(30, 41, 59, 0.9)',
      },
      backgroundColor: {
        primary: 'rgb(26, 31, 58)',
        card: 'rgba(30, 41, 59, 0.9)',
      },
      textColor: {
        light: 'rgb(255, 255, 255)',
        muted: 'rgb(160, 174, 192)',
      },
      borderColor: {
        color: 'rgb(45, 55, 72)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        'gradient-button': 'linear-gradient(135deg, #22d3ee, #10b981)',
      },
    },
  },
  plugins: [],
};
export default config;
