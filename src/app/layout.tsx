import "./globals.css";
import Link from "next/link";
export const metadata = { title: "StreamPulse", description: "Citizen stream data to One Health insights" };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="bg-background text-foreground">
    <header className="sticky top-0 z-[1000] border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-700 to-cyan-700 text-white shadow-md shadow-teal-900/20" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3.5S6.5 10 6.5 14a5.5 5.5 0 0 0 11 0C17.5 10 12 3.5 12 3.5Z"/><path d="M9 15.5c.4 1.3 1.3 2 2.8 2.2"/></svg></span>
          <span><span className="block text-base font-bold tracking-tight text-slate-950">StreamPulse</span><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-800">Community water intelligence</span></span>
        </Link>
        <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 text-sm font-medium">
          <Link href="/" className="rounded-lg px-3 py-2 text-slate-700 transition hover:bg-white hover:text-teal-900 hover:shadow-sm">Dashboard</Link>
          <Link href="/resilience" className="rounded-lg px-3 py-2 text-slate-700 transition hover:bg-white hover:text-teal-900 hover:shadow-sm">Resilience data</Link>
          <Link href="/about" className="hidden rounded-lg px-3 py-2 text-slate-700 transition hover:bg-white hover:text-teal-900 hover:shadow-sm sm:block">About One Health</Link>
        </div>
      </nav>
    </header>
    <main className="mx-auto min-h-[calc(100vh-68px)] max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
    <footer className="border-t border-slate-200/80 bg-white/60"><div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span>StreamPulse · Community observations for healthier waterways</span><span>One Health · Ecosystems, animals, and people</span></div></footer>
  </body></html>;
}
