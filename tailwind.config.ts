import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        danger: "hsl(var(--danger))",
        ring: "hsl(var(--ring))"
      },
      borderRadius: {
        xl: "1rem",
        lg: "0.75rem",
        md: "0.5rem"
      },
      boxShadow: {
        card: "0 10px 30px -20px hsl(var(--shadow) / 0.5)",
        "card-hover": "0 18px 40px -28px hsl(var(--shadow) / 0.6)"
      }
    }
  },
  plugins: []
};

export default config;
