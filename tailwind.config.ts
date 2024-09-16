import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			'neon-blue': '#00f3ff',
  			'neon-pink': '#ff00ff',
  			'neon-green': '#39ff14',
  			'matrix-green': '#00ff00',
  			'cyber-black': '#0a0a0a',
  			'neon-purple': '#b300ff',
  			'cyber-yellow': '#ffff00',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			'cyber': ['Orbitron', 'sans-serif'],
  			'matrix': ['Courier New', 'monospace'],
  		},
  		boxShadow: {
  			'neon-glow': '0 0 5px theme("colors.matrix-green"), 0 0 20px theme("colors.matrix-green")',
  			'purple-glow': '0 0 5px theme("colors.neon-purple"), 0 0 20px theme("colors.neon-purple")',
  		},
  		animation: {
  			'matrix-rain': 'matrix-rain 20s linear infinite',
  		},
  		keyframes: {
  			'matrix-rain': {
  				'0%': { transform: 'translateY(-100%)' },
  				 '100%': { transform: 'translateY(100%)' },
  			},
  		},
  	},
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
