import "./globals.css";
import Link from "next/link";
export const metadata = { title: "StreamPulse", description: "Citizen stream data to One Health insights" };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="bg-background text-foreground">
    <header className="border-b bg-card"><nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 p-4">
      <Link href="/" className="text-lg font-bold text-primary">StreamPulse</Link>
      <Link href="/" className="text-sm hover:underline">Dashboard</Link>
      <Link href="/resilience" className="text-sm hover:underline">Research resilience</Link>
      <Link href="/about" className="text-sm hover:underline">About One Health</Link>
    </nav></header>
    <main className="mx-auto max-w-6xl p-4">{children}</main></body></html>;
}
