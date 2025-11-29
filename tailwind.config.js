/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arcade: ['"Press Start 2P"', 'cursive'],
        retro: ['VT323', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Arcade color palette
        arcade: {
          black: "var(--arcade-black)",
          dark: "var(--arcade-dark)",
          mid: "var(--arcade-mid)",
          pink: "var(--arcade-pink)",
          cyan: "var(--arcade-cyan)",
          yellow: "var(--arcade-yellow)",
          green: "var(--arcade-green)",
          purple: "var(--arcade-purple)",
          orange: "var(--arcade-orange)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'glow-pink': '0 0 20px rgba(255, 45, 149, 0.5), 0 0 40px rgba(255, 45, 149, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 255, 245, 0.5), 0 0 40px rgba(0, 255, 245, 0.3)',
        'glow-yellow': '0 0 20px rgba(255, 230, 109, 0.5), 0 0 40px rgba(255, 230, 109, 0.3)',
        'glow-green': '0 0 20px rgba(57, 255, 20, 0.5), 0 0 40px rgba(57, 255, 20, 0.3)',
        'glow-purple': '0 0 20px rgba(181, 55, 242, 0.5), 0 0 40px rgba(181, 55, 242, 0.3)',
        'glow-pink-sm': '0 0 10px rgba(255, 45, 149, 0.4)',
        'glow-cyan-sm': '0 0 10px rgba(0, 255, 245, 0.4)',
      },
      animation: {
        'arcade-spin': 'arcade-spin 1s linear infinite',
        'arcade-pulse': 'arcade-pulse 2s ease-in-out infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        'arcade-spin': {
          to: { transform: 'rotate(360deg)' },
        },
        'arcade-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.97' },
        },
      },
    },
  },
  plugins: [],
}
