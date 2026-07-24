import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Users,
  Rocket,
  Globe,
  Wrench,
  Flag,
  Trophy,
  Lock,
  ChevronDown,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Sparkles,
  Check,
} from "lucide-react";

import { fetchCollections, fetchItems, refreshSignedUrl, type Collection } from "@/lib/gallery";
import { SiteHeader, Logo, CicLogo } from "@/components/SiteHeader";
import setaMark from "@/assets/seta-mark.png.asset.json";
import { useText, useLines } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  component: HomePage,
});

// ---------- Motion helpers ----------
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={stagger}
      className={`relative ${className}`}
    >
      {children}
    </motion.section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} className="flex justify-center">
      <span className="chip">{children}</span>
    </motion.div>
  );
}

// External application form
const APPLY_URL = "https://forms.gle/nCGCM6hAmvDdCJSE7";

// ---------- Hero ----------
function Hero() {
  const reduce = useReducedMotion();
  const chip = useText("hero.chip");
  const titlePre = useText("hero.title.pre");
  const titleBrand = useText("hero.title.brand");
  const subtitle = useText("hero.subtitle");
  const cta = useText("hero.cta");
  const features = [
    { icon: Globe, title: useText("hero.f1.title"), text: useText("hero.f1.text") },
    { icon: Users, title: useText("hero.f2.title"), text: useText("hero.f2.text") },
    { icon: Rocket, title: useText("hero.f3.title"), text: useText("hero.f3.text") },
  ];
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-[1] h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.55 0.25 240 / 0.55), oklch(0.5 0.22 300 / 0.35) 40%, transparent 70%)",
        }}
      />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:py-24"
      >
        <div className="mb-6 flex justify-center">
          <span className="chip">
            <Sparkles className="h-3 w-3" />
            {chip}
          </span>
        </div>

        <h1 className="font-display font-semibold tracking-tight" style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", lineHeight: 1.05 }}>
          <span className="block uppercase">{titlePre} <span className="text-cyan">{titleBrand}</span></span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-foreground/70 sm:text-base">
          {subtitle}
        </p>
        <p className="mx-auto mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-cyan/90">
          13 — 15 Aug
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary text-base">
            {cta} <ArrowRight className="h-4 w-4" />
          </a>
        </div>

      </motion.div>

      <Section className="mx-auto max-w-7xl px-4 pb-24">

        <motion.div variants={stagger} className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp} className="glass hover-lift rounded-3xl p-7">
              <div className="grid h-12 w-12 place-items-center rounded-2xl text-cyan" style={{ background: "color-mix(in oklab, var(--cyan) 15%, transparent)" }}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display mt-6 text-lg font-semibold">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </section>
  );
}

// ---------- About ----------
function About() {
  const chip = useText("about.chip");
  const pre = useText("about.title.pre");
  const brand = useText("about.title.brand");
  const paragraphs = [
    useText("about.p1"),
    useText("about.p2"),
    useText("about.p3"),
    useText("about.p4"),
  ];
  const tags = useLines("about.tags");
  return (
    <Section id="about" className="mx-auto max-w-6xl px-4 py-24">
      <SectionLabel>{chip}</SectionLabel>
      <motion.div variants={fadeUp} className="relative mt-10 overflow-hidden rounded-[2rem]">
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-60 blur-3xl" style={{ background: "oklch(0.55 0.25 240 / 0.5)" }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full opacity-50 blur-3xl" style={{ background: "oklch(0.5 0.22 300 / 0.45)" }} />
        <div className="glass-strong rounded-[2rem] p-8 sm:p-14">
          <motion.h2 variants={fadeUp} className="text-3xl font-semibold sm:text-5xl">
            {pre} <span className="text-gradient">{brand}</span>
          </motion.h2>
          <motion.div variants={stagger} className="mt-8 space-y-5 text-base leading-relaxed text-foreground/80">
            {paragraphs.map((p, i) => (
              <motion.p key={i} variants={fadeUp}>{p}</motion.p>
            ))}
          </motion.div>
          <motion.div variants={stagger} className="mt-10 flex flex-wrap gap-2">
            {tags.map((t) => (
              <motion.span key={t} variants={fadeUp} className="rounded-full border border-border bg-white/5 px-4 py-1.5 text-sm text-foreground/80 backdrop-blur">
                {t}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </Section>
  );
}

// ---------- Domains ----------
function Domains() {
  const chip = useText("domains.chip");
  const pre = useText("domains.title.pre");
  const brand = useText("domains.title.brand");
  const items = [
    { icon: "🌌", title: useText("domains.d1.title"), text: useText("domains.d1.text"), accent: "oklch(0.65 0.2 250)", grad: "linear-gradient(135deg, oklch(0.5 0.22 250 / 0.55), oklch(0.35 0.18 270 / 0.25))" },
    { icon: "⚡", title: useText("domains.d2.title"), text: useText("domains.d2.text"), accent: "oklch(0.82 0.17 90)", grad: "linear-gradient(135deg, oklch(0.72 0.19 90 / 0.5), oklch(0.6 0.2 55 / 0.25))" },
    { icon: "🌱", title: useText("domains.d3.title"), text: useText("domains.d3.text"), accent: "oklch(0.72 0.18 155)", grad: "linear-gradient(135deg, oklch(0.6 0.19 155 / 0.55), oklch(0.5 0.17 175 / 0.25))" },
    { icon: "💻", title: useText("domains.d4.title"), text: useText("domains.d4.text"), accent: "oklch(0.7 0.22 320)", grad: "linear-gradient(135deg, oklch(0.55 0.24 320 / 0.55), oklch(0.45 0.22 290 / 0.25))" },
  ];
  return (
    <Section id="domains" className="mx-auto max-w-7xl px-4 py-24">
      <SectionLabel>{chip}</SectionLabel>
      <motion.h2 variants={fadeUp} className="mt-6 text-center text-3xl font-semibold sm:text-5xl">
        {pre} <span className="text-gradient">{brand}</span>
      </motion.h2>
      <motion.div variants={stagger} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((d) => (
          <motion.div
            key={d.title}
            variants={fadeUp}
            className="glass hover-lift relative overflow-hidden rounded-3xl p-7"
            style={{
              borderColor: `color-mix(in oklab, ${d.accent} 45%, transparent)`,
              boxShadow: `0 0 40px -12px color-mix(in oklab, ${d.accent} 55%, transparent)`,
            }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-80" style={{ background: d.grad }} />
            <div className="relative">
              <div className="text-4xl">{d.icon}</div>
              <h3 className="font-display mt-5 text-lg font-semibold" style={{ color: d.accent }}>{d.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">{d.text}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

// ---------- Journey ----------
function Journey() {
  const chip = useText("journey.chip");
  const pre = useText("journey.title.pre");
  const brand = useText("journey.title.brand");
  const subtitle = useText("journey.subtitle");
  const days = [
    { icon: Rocket, label: useText("journey.day1.label"), title: useText("journey.day1.title"), subtitle: useText("journey.day1.subtitle"), items: useLines("journey.day1.items") },
    { icon: Wrench, label: useText("journey.day2.label"), title: useText("journey.day2.title"), subtitle: useText("journey.day2.subtitle"), items: useLines("journey.day2.items") },
    { icon: Flag, label: useText("journey.day3.label"), title: useText("journey.day3.title"), subtitle: useText("journey.day3.subtitle"), items: useLines("journey.day3.items") },
  ];
  return (
    <Section id="journey" className="mx-auto max-w-7xl px-4 py-24">
      <SectionLabel>{chip}</SectionLabel>
      <motion.h2 variants={fadeUp} className="mt-6 text-center text-3xl font-semibold sm:text-5xl">
        {pre} <span className="text-gradient">{brand}</span>
      </motion.h2>
      <motion.p variants={fadeUp} className="mt-4 text-center text-muted-foreground">
        {subtitle}
      </motion.p>
      <motion.div variants={stagger} className="mt-14 grid gap-6 md:grid-cols-3">
        {days.map((j, i) => (
          <motion.div key={j.label} variants={fadeUp} className="glass hover-lift relative rounded-3xl p-7">
            <div className="flex items-center justify-between">
              <span className="chip">{j.label}</span>
              <span className="font-display text-4xl font-semibold text-cyan/20">0{i + 1}</span>
            </div>
            <div className="mt-6 grid h-12 w-12 place-items-center rounded-2xl text-cyan" style={{ background: "color-mix(in oklab, var(--cyan) 15%, transparent)" }}>
              <j.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display mt-5 text-xl font-semibold">{j.title}</h3>
            <p className="mt-1 text-sm text-cyan">{j.subtitle}</p>
            <ul className="mt-5 space-y-2.5 text-sm text-foreground/80">
              {j.items.map((it) => (
                <li key={it} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-cyan" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

// ---------- Tracks ----------
type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type Challenge = { level: Difficulty; title: string; description: string };
type TrackCol = { icon: string; name: string; challenges: Challenge[] };

const DIFF_STYLES: Record<Difficulty, { border: string; badgeBg: string; badgeText: string; glow: string; dot: string }> = {
  Beginner: {
    border: "border-emerald-400/50",
    badgeBg: "bg-emerald-400/15",
    badgeText: "text-emerald-300",
    glow: "0 0 40px -8px oklch(0.75 0.18 155 / 0.55)",
    dot: "bg-emerald-400",
  },
  Intermediate: {
    border: "border-amber-400/50",
    badgeBg: "bg-amber-400/15",
    badgeText: "text-amber-300",
    glow: "0 0 40px -8px oklch(0.82 0.17 85 / 0.55)",
    dot: "bg-amber-400",
  },
  Advanced: {
    border: "border-rose-400/50",
    badgeBg: "bg-rose-400/15",
    badgeText: "text-rose-300",
    glow: "0 0 40px -8px oklch(0.7 0.22 25 / 0.55)",
    dot: "bg-rose-400",
  },
};

const TRACK_COLUMNS: TrackCol[] = [
  {
    icon: "🌌",
    name: "Astronomy & Space",
    challenges: [
      { level: "Beginner", title: "Living Beyond Earth", description: "Design sustainable technologies and systems that enable humans to live safely and efficiently on the Moon, Mars, or beyond." },
      { level: "Intermediate", title: "Protecting Earth from Space Threats", description: "Develop innovative solutions to detect, predict, or respond to space hazards such as asteroids, solar storms, and other cosmic threats that impact Earth." },
      { level: "Advanced", title: "Developing Solutions for Deep Space Communications", description: "Reimagine how spacecraft can exchange reliable data across vast distances where delays, interference, and signal loss become major challenges." },
    ],
  },
  {
    icon: "🌱",
    name: "Sustainability",
    challenges: [
      { level: "Beginner", title: "Rethinking Consumption & Waste", description: "Create innovative ideas that reduce waste, encourage circular economies, and promote responsible production and consumption." },
      { level: "Intermediate", title: "Securing the World's Water Future", description: "Develop solutions that improve water conservation, quality, accessibility, or monitoring to help secure clean water for future generations." },
      { level: "Advanced", title: "Climate Adaptation & Resilience", description: "Design solutions that help communities prepare for, adapt to, and recover from the growing impacts of climate change." },
    ],
  },
  {
    icon: "⚡",
    name: "Energy",
    challenges: [
      { level: "Beginner", title: "Energy Access for All", description: "Design affordable and scalable solutions that bring reliable electricity to underserved and remote communities around the world." },
      { level: "Intermediate", title: "Energy Storage Beyond Batteries", description: "Explore next-generation ways to store and manage energy beyond traditional batteries for a cleaner and more resilient future." },
      { level: "Advanced", title: "The Future of Energy Infrastructure", description: "Create innovative concepts for smarter, more resilient, and sustainable energy systems that can power future cities and communities." },
    ],
  },
  {
    icon: "💻",
    name: "Technology & AI",
    challenges: [
      { level: "Beginner", title: "Bridging the Digital Divide", description: "Develop accessible technologies that expand digital inclusion and ensure equal opportunities for people everywhere." },
      { level: "Intermediate", title: "Trust, Privacy & Security in a Digital World", description: "Build technologies that enhance cybersecurity, protect user privacy, and strengthen trust in digital systems." },
      { level: "Advanced", title: "Human-AI Futures", description: "Imagine how humans and AI can collaborate ethically and effectively to shape the future of work, learning, and creativity." },
    ],
  },
];

function Tracks() {
  const chip = useText("tracks.chip");
  const pre = useText("tracks.title.pre");
  const brand = useText("tracks.title.brand");
  return (
    <Section id="tracks" className="mx-auto max-w-7xl px-4 py-24">
      <SectionLabel><Trophy className="h-3.5 w-3.5" /> {chip}</SectionLabel>
      <motion.h2 variants={fadeUp} className="mt-6 text-center text-3xl font-semibold sm:text-5xl">
        {pre}
      </motion.h2>
      <motion.div variants={stagger} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TRACK_COLUMNS.map((col) => (
          <motion.div key={col.name} variants={fadeUp} className="flex flex-col gap-5">
            <div className="glass rounded-2xl px-5 py-4 text-center">
              <div className="text-3xl">{col.icon}</div>
              <h3 className="font-display mt-2 text-lg font-semibold">{col.name}</h3>
            </div>
            {col.challenges.map((ch) => {
              const s = DIFF_STYLES[ch.level];
              return (
                <div
                  key={ch.title}
                  className={`glass group relative flex flex-col overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 ${s.border}`}
                  style={{ boxShadow: "0 20px 60px -30px oklch(0.1 0.05 260 / 0.6)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = s.glow)}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 20px 60px -30px oklch(0.1 0.05 260 / 0.6)")}
                >
                  <div className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${s.badgeBg} ${s.badgeText}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {ch.level}
                  </div>
                  <h4 className="font-display mt-4 text-base font-semibold leading-snug">{ch.title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/75">{ch.description}</p>
                </div>
              );
            })}
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

function InnovationChallenge() {
  const requirements = [
    "Define your own real-world problem.",
    "Develop an innovative solution.",
    "Integrate at least TWO of our core domains.",
  ];
  const domains = [
    { icon: "🌌", label: "Astronomy", accent: "bg-cyan/10 text-cyan" },
    { icon: "⚡", label: "Energy", accent: "bg-amber-400/10 text-amber-300" },
    { icon: "🌱", label: "Sustainability", accent: "bg-emerald-400/10 text-emerald-300" },
    { icon: "💻", label: "Technology", accent: "bg-violet-400/10 text-violet-300" },
  ];

  return (
    <Section id="innovation" className="mx-auto max-w-7xl px-4 py-24">
      <motion.div variants={fadeUp} className="glass-strong relative overflow-hidden rounded-[2rem] p-8 sm:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 top-8 h-52 w-52 rounded-full opacity-40 blur-3xl"
          style={{ background: "oklch(0.55 0.18 240 / 0.28)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 bottom-10 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "oklch(0.7 0.16 90 / 0.22)" }}
        />

        <div className="relative grid gap-10 xl:grid-cols-[1.05fr_0.95fr] items-start">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan shadow-sm shadow-cyan/10">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan" />
              Special Challenge
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Innovation Challenge
              </h2>
              <p className="text-xl font-semibold text-cyan/90">Beyond Boundaries</p>
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">
              Have an idea that doesn’t fit a single challenge? Create your own challenge and build an innovative solution that combines at least two SETA HACK core domains.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {domains.map((domain) => (
                <div
                  key={domain.label}
                  className="glass group rounded-2xl border border-border/15 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40"
                >
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-3xl ${domain.accent} shadow-[0_20px_60px_-40px_rgba(32,210,255,0.3)]`}>
                    <span className="text-2xl">{domain.icon}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{domain.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[2rem] border border-cyan/15 bg-background/70 p-6 shadow-[0_30px_55px_-35px_rgba(32,210,255,0.18)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan/80">Requirements</p>
              <div className="mt-5 space-y-4">
                {requirements.map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-relaxed text-foreground/80">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan/10 text-cyan">
                      <Check className="h-4 w-4" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-start">
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary text-base">
                Apply now <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-full sm:max-w-[30rem]">
            <div className="glass group relative overflow-hidden rounded-[2rem] border border-border/10 bg-[#07111f]/90 p-8 shadow-[0_30px_90px_-40px_rgba(32,210,255,0.28)] transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_28%)]" />
              <div className="relative flex justify-center py-6">
                <div className="relative w-full max-w-[320px] aspect-square sm:max-w-[340px]">
                  <div className="absolute inset-0 rounded-full border border-cyan/10" />
                  <div className="absolute inset-8 rounded-full border border-violet/10" />
                  <div className="absolute inset-16 rounded-full border border-cyan/10" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-24 w-24 items-center justify-center rounded-full border border-cyan/20 bg-background/95 shadow-[0_0_0_10px_rgba(15,23,42,0.32)]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan/10">
                      <img src={setaMark.url} alt="SETA mark" className="h-10 w-10 object-contain" />
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-2 -translate-x-1/2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan/15 bg-cyan/10 text-2xl text-cyan shadow-[0_20px_60px_-40px_rgba(32,210,255,0.35)]">
                      🌌
                    </div>
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/15 bg-amber-400/10 text-2xl text-amber-300 shadow-[0_20px_60px_-40px_rgba(251,191,36,0.3)]">
                      ⚡
                    </div>
                  </div>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/15 bg-emerald-400/10 text-2xl text-emerald-300 shadow-[0_20px_60px_-40px_rgba(52,211,153,0.3)]">
                      🌱
                    </div>
                  </div>
                  <div className="absolute left-1/2 bottom-2 -translate-x-1/2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-violet-400/15 bg-violet-400/10 text-2xl text-violet-300 shadow-[0_20px_60px_-40px_rgba(168,85,247,0.3)]">
                      💻
                    </div>
                  </div>
                </div>
              </div>

              <blockquote className="relative z-10 mt-6 text-center text-sm italic leading-relaxed text-muted-foreground">
                “The greatest innovations happen where disciplines meet.”
              </blockquote>
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

// ---------- Temporary Challenges placeholder ----------
// This component hides the full Tracks section while the challenges are being finalized.
// To restore the original Challenges section, replace <ChallengesPlaceholder /> with <Tracks /> in HomePage.
function ChallengesPlaceholder() {
  const chip = useText("tracks.chip");
  const pre = useText("tracks.title.pre");
  const brand = useText("tracks.title.brand");
  return (
    <Section id="challenges" className="mx-auto max-w-7xl px-4 py-24">
      <SectionLabel>{chip}</SectionLabel>
      <motion.h2 variants={fadeUp} className="mt-6 flex items-center justify-center gap-3 text-center text-3xl font-semibold sm:text-5xl">
        <Lock className="h-6 w-6 text-cyan/70 sm:h-8 sm:w-8" />
        <span>
          {pre} <span className="text-gradient">{brand}</span>
        </span>
      </motion.h2>
      <motion.div variants={fadeUp} className="mt-12 flex justify-center">
        <div className="glass-strong relative w-full max-w-2xl overflow-hidden rounded-[2rem] p-10 text-center sm:p-16">
          {/* soft cyan glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(closest-side, oklch(0.55 0.25 240 / 0.45), transparent 70%)" }}
          />

          {/* floating particles */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-cyan/40"
                style={{
                  left: `${15 + i * 14}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -18, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>

          <div className="relative">
            {/* Launching Soon badge */}
            <motion.div
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan"
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
              </span>
              Launching Soon
            </motion.div>

            {/* Glowing question mark inside circular frame */}
            <div className="mx-auto mb-6 grid h-32 w-32 place-items-center rounded-full border border-cyan/40 bg-cyan/5 sm:h-40 sm:w-40">
              <motion.span
                className="text-6xl font-light text-cyan sm:text-7xl"
                style={{ textShadow: "0 0 30px oklch(0.75 0.2 240 / 0.8), 0 0 60px oklch(0.65 0.22 240 / 0.5)" }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                ?
              </motion.span>
            </div>

            <h3 className="font-display text-2xl font-semibold sm:text-3xl">Challenges Locked</h3>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/70">
              Our official challenge statements are being finalized. Stay tuned for the reveal.
            </p>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

// ---------- Gallery Preview ----------
function GalleryPreview() {
  const chip = useText("gpreview.chip");
  const pre = useText("gpreview.title.pre");
  const brand = useText("gpreview.title.brand");
  const subtitle = useText("gpreview.subtitle");
  const cta = useText("gpreview.cta");
  const cardChip = useText("gpreview.collectionChip");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cols = await fetchCollections();
        if (cancelled) return;
        const first = cols.slice(0, 6);
        setCollections(first);
        const entries = await Promise.all(
          first.map(async (c) => {
            try {
              const items = await fetchItems(c.id);
              for (const it of items) {
                const im = it.images[0];
                if (im) {
                  const url = im.storage_path
                    ? (await refreshSignedUrl(im.storage_path)) || im.image_url
                    : im.image_url;
                  return [c.id, url] as const;
                }
              }
            } catch {}
            return [c.id, ""] as const;
          })
        );
        if (cancelled) return;
        setThumbs(Object.fromEntries(entries));
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (collections.length === 0) return null;

  return (
    <Section id="gallery" className="mx-auto max-w-7xl px-4 py-24">
      <SectionLabel>{chip}</SectionLabel>
      <motion.h2 variants={fadeUp} className="mt-6 text-center text-3xl font-semibold sm:text-5xl">
        {pre} <span className="text-gradient">{brand}</span>
      </motion.h2>
      <motion.p variants={fadeUp} className="mt-4 text-center text-muted-foreground">
        {subtitle}
      </motion.p>
      <motion.div variants={stagger} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <motion.div key={c.id} variants={fadeUp}>
            <Link
              to="/gallery"
              className="glass hover-lift group block overflow-hidden rounded-3xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
                {thumbs[c.id] ? (
                  <img
                    src={thumbs[c.id]}
                    alt={c.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.5 0.22 240 / 0.35), oklch(0.5 0.22 300 / 0.25))",
                    }}
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              </div>
              <div className="p-6">
                <div className="chip mb-3">{cardChip}</div>
                <h3 className="font-display text-lg font-semibold group-hover:text-cyan">
                  {c.title}
                </h3>
                {c.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {c.description}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      <motion.div variants={fadeUp} className="mt-12 flex justify-center">
        <Link to="/gallery" className="btn-primary text-sm">
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </Section>
  );
}

// ---------- Partners ----------
function Partners() {
  const chip = useText("partners.chip");
  const pre = useText("partners.title.pre");
  const brand = useText("partners.title.brand");
  const subtitle = useText("partners.subtitle");
  const slot = useText("partners.slotLabel");
  const hostedBy = useText("partners.hostedBy");
  return (
    <Section id="partners" className="mx-auto max-w-7xl px-4 py-24">
      <SectionLabel>{chip}</SectionLabel>
      <motion.h2 variants={fadeUp} className="mt-6 text-center text-3xl font-semibold sm:text-5xl">
        {pre} <span className="text-gradient">{brand}</span>
      </motion.h2>
      <motion.p variants={fadeUp} className="mt-4 text-center text-muted-foreground">
        {subtitle}
      </motion.p>
      <motion.div variants={stagger} className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="glass grid h-24 place-items-center rounded-2xl text-xs uppercase tracking-[0.3em] text-muted-foreground"
          >
            {slot}
          </motion.div>
        ))}
      </motion.div>
      <motion.div variants={fadeUp} className="mt-16 text-center">
        <span className="chip block mx-auto w-35">{hostedBy}</span>
        <div className="glass mt-4 mx-auto flex items-center gap-3 rounded-2xl px-6 py-4 w-100">
          <CicLogo />
        </div>
        <p className="mx-auto mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-cyan/90">
          13 — 15 Aug
        </p>
      </motion.div>
    </Section>
  );
}

// ---------- FAQ ----------
function FAQ() {
  const chip = useText("faq.chip");
  const pre = useText("faq.title.pre");
  const brand = useText("faq.title.brand");
  const faqs = [
    { q: useText("faq.q1"), a: useText("faq.a1") },
    { q: useText("faq.q2"), a: useText("faq.a2") },
    { q: useText("faq.q3"), a: useText("faq.a3") },
    { q: useText("faq.q4"), a: useText("faq.a4") },
    { q: useText("faq.q5"), a: useText("faq.a5") },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section id="faq" className="mx-auto max-w-3xl px-4 py-24">
      <SectionLabel>{chip}</SectionLabel>
      <motion.h2 variants={fadeUp} className="mt-6 text-center text-3xl font-semibold sm:text-5xl">
        {pre} <span className="text-gradient">{brand}</span>
      </motion.h2>
      <motion.div variants={stagger} className="mt-12 space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <motion.div key={i} variants={fadeUp} className="glass overflow-hidden rounded-2xl">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-medium">{f.q}</span>
                <ChevronDown className={`h-4 w-4 flex-none transition-transform ${isOpen ? "rotate-180 text-cyan" : ""}`} />
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}

// ---------- Apply ----------
function Apply() {
  const title = useText("apply.title");
  const body = useText("apply.body");
  const cta = useText("apply.cta");
  return (
    <Section id="apply" className="mx-auto max-w-4xl px-4 py-24">
      <motion.div variants={fadeUp} className="glass-strong relative overflow-hidden rounded-[2rem] p-10 text-center sm:p-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-80" style={{ background: "radial-gradient(ellipse at center, oklch(0.55 0.25 240 / 0.4), transparent 65%)" }} />
        <div className="relative">
          <div className="text-5xl">🚀</div>
          <h2 className="font-display mt-5 text-4xl font-semibold sm:text-6xl">
            <span className="text-gradient">{title}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-foreground/80">
            {body}
          </p>

          <div className="mt-10 flex justify-center">
            <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary text-base">
              {cta} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

// ---------- Footer ----------
function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M19.6 6.7a5.6 5.6 0 0 1-3.3-1.1 5.6 5.6 0 0 1-2.1-3.4h-3v13.1a2.8 2.8 0 1 1-2-2.7v-3a5.8 5.8 0 1 0 5 5.7V9.5a8.6 8.6 0 0 0 5.4 1.9v-3a5.7 5.7 0 0 1 0 -1.7Z" />
    </svg>
  );
}

function Footer() {
  const tagline = useText("brand.suffix");
  const email = useText("footer.email");
  const copyright = useText("footer.copyright");
  const hostedBy = useText("partners.hostedBy");
  const socials = [
    { Icon: Facebook, href: "https://www.facebook.com/share/1HmAgL3oyD/", label: "Facebook" },
    { Icon: Instagram, href: "https://www.instagram.com/setahackathon", label: "Instagram" },
    { Icon: Linkedin, href: "https://www.linkedin.com/company/seta-hack/", label: "LinkedIn" },
    { Icon: TikTokIcon, href: "https://www.tiktok.com/@setahack", label: "TikTok" },
  ];
  return (
    <footer className="relative border-t border-border/30 py-14">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-[0.22em] sm:text-4xl">
          SETA <span className="text-gradient">HACK</span>
        </h2>
        <p className="font-display mt-3 text-sm tracking-[0.25em] text-cyan/90 sm:text-base">
          {tagline}
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-foreground/50">{hostedBy}</span>
          <CicLogo />
        </div>
        <a href={`mailto:${email}`} className="mt-6 inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-cyan">
          <Mail className="h-4 w-4" /> {email}
        </a>
        <div className="mt-6 flex justify-center gap-3">
          {socials.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="glass grid h-10 w-10 place-items-center rounded-full text-foreground/70 transition hover:text-cyan"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">{copyright}</p>
      </div>
    </footer>
  );
}

function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      
      <div className="relative z-10">
        <SiteHeader />
        <main>
          <Hero />
          <About />
          <Domains />
          <Journey />
          
          <Tracks />
          <InnovationChallenge />
          <GalleryPreview />
          <Partners />
          <FAQ />
          <Apply />
        </main>
        <Footer />
      </div>
    </div>
  );
}
