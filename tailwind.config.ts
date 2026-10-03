const c = (n: string) => ({ DEFAULT: `hsl(var(--${n}))`, foreground: `hsl(var(--${n}-foreground))` });
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))", background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
      primary: c("primary"), secondary: c("secondary"), destructive: c("destructive"), muted: c("muted"), accent: c("accent"), card: c("card") },
    borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" } } },
  plugins: [],
};
