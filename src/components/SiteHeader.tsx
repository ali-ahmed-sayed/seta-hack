import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sun, Moon, Menu, X } from "lucide-react";
import setaMark from "@/assets/seta-mark.png.asset.json";
import cicLogo from "@/assets/cic-logo.png.asset.json";
import { useText } from "@/lib/site-content";

type NavItem = { key: string; href: string; to?: string };

const NAV: NavItem[] = [
  { key: "nav.about", href: "/#about" },
  { key: "nav.domains", href: "/#domains" },
  { key: "nav.journey", href: "/#journey" },
  { key: "nav.tracks", href: "/#challenges" },
  { key: "nav.gallery", href: "/gallery", to: "/gallery" },
  { key: "nav.partners", href: "/#partners" },
  { key: "nav.faq", href: "/#faq" },
];

export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const saved = localStorage.getItem("seta-theme") as "dark" | "light" | null;
    const initial =
      saved ?? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(initial);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("seta-theme", theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full"
        style={{
          filter:
            "drop-shadow(0 0 8px oklch(0.85 0.18 220 / 0.9)) drop-shadow(0 0 18px oklch(0.78 0.17 230 / 0.7)) drop-shadow(0 0 36px oklch(0.78 0.17 230 / 0.45))",
        }}
      >
        <img src={setaMark.url} alt="" className="relative z-10 h-9 w-9 object-contain" />
      </div>
      <span className="font-display text-[13px] font-semibold tracking-[0.22em] text-foreground sm:text-sm">
        SETA <span className="text-cyan">HACK</span>
      </span>
    </div>
  );
}

export function CicLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-xl border border-border/40 bg-white p-1 shadow-lg"
        style={{ boxShadow: "0 8px 30px -10px oklch(0.1 0.05 260 / 0.35)" }}
      >
        <img
          src={cicLogo.url}
          alt="Canadian International College"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex flex-col text-left">
        <span className="font-display text-sm font-semibold tracking-[0.12em] text-foreground">
          CIC
        </span>
        <span className="text-[11px] font-medium tracking-[0.15em] text-foreground/60">
          Canadian International College
        </span>
      </div>
    </div>
  );
}

function NavLabel({ k }: { k: string }) {
  const v = useText(k);
  return <>{v}</>;
}

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const cta = useText("header.cta");
  const adminLabel = useText("nav.admin");
  return (
    <header className="sticky top-4 z-50 px-3 sm:px-6">
      <div
        className="mx-auto flex max-w-6xl items-center justify-between gap-6 rounded-full px-3 py-2.5 pl-5 backdrop-blur-2xl"
        style={{
          background: "color-mix(in oklab, var(--background) 55%, transparent)",
          border: "1px solid color-mix(in oklab, var(--cyan) 18%, transparent)",
          boxShadow:
            "0 1px 0 0 oklch(1 0 0 / 0.05) inset, 0 20px 60px -25px oklch(0.1 0.05 260 / 0.7), 0 0 40px -12px color-mix(in oklab, var(--cyan) 30%, transparent)",
        }}
      >
        <Link to="/" className="shrink-0"><Logo /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) =>
            n.to ? (
              <Link key={n.href} to={n.to} className="rounded-full px-3.5 py-1.5 text-[13px] text-foreground/70 transition hover:bg-white/5 hover:text-cyan">
                <NavLabel k={n.key} />
              </Link>
            ) : (
              <a key={n.href} href={n.href} className="rounded-full px-3.5 py-1.5 text-[13px] text-foreground/70 transition hover:bg-white/5 hover:text-cyan">
                <NavLabel k={n.key} />
              </a>
            )
          )}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 transition hover:bg-white/5 hover:text-cyan"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a href="https://forms.gle/nCGCM6hAmvDdCJSE7" target="_blank" rel="noopener noreferrer" className="btn-primary hidden text-sm sm:inline-flex">
            {cta} <ArrowRight className="h-4 w-4" />
          </a>
          <button
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 hover:bg-white/5"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div
          className="mx-auto mt-2 max-w-6xl rounded-3xl p-2 backdrop-blur-2xl"
          style={{
            background: "color-mix(in oklab, var(--background) 65%, transparent)",
            border: "1px solid color-mix(in oklab, var(--cyan) 15%, transparent)",
          }}
        >
          <nav className="flex flex-col gap-1">
            {NAV.map((n) =>
              n.to ? (
                <Link key={n.href} to={n.to} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-2.5 text-sm text-foreground/80 hover:bg-white/5 hover:text-cyan">
                  <NavLabel k={n.key} />
                </Link>
              ) : (
                <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-2.5 text-sm text-foreground/80 hover:bg-white/5 hover:text-cyan">
                  <NavLabel k={n.key} />
                </a>
              )
            )}
            <div className="my-1 h-px bg-white/10" />
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-2.5 text-xs uppercase tracking-widest text-foreground/40 hover:bg-white/5 hover:text-cyan"
            >
              {adminLabel}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
