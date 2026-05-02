import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        bg4: 'var(--bg4)',
        border: 'var(--border)',
        border2: 'var(--border2)',
        text1: 'var(--text1)',
        text2: 'var(--text2)',
        text3: 'var(--text3)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        green: 'var(--green)',
        amber: 'var(--amber)',
        red: 'var(--red)',
        cyan: 'var(--cyan)'
      },
    },
  },
  plugins: [],
}
export default config
