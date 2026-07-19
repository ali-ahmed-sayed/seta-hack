import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

// -----------------------------------------------------------------------------
// Defaults: every editable text label on the site.
// Any key added here appears as an editable field in the admin Content tab.
// Missing key in DB -> default is used, so the site never breaks.
// -----------------------------------------------------------------------------

export type ContentField = {
  key: string;
  label: string;
  group: string;
  default: string;
  multiline?: boolean;
};

export const CONTENT_FIELDS: ContentField[] = [
  // Header / nav
  { key: "nav.about", group: "Header & Navigation", label: "Nav: About", default: "About" },
  { key: "nav.domains", group: "Header & Navigation", label: "Nav: Core Domains", default: "Domains" },
  { key: "nav.journey", group: "Header & Navigation", label: "Nav: Innovation Journey", default: "Journey" },
  { key: "nav.tracks", group: "Header & Navigation", label: "Nav: Challenges", default: "Challenges" },
  { key: "nav.gallery", group: "Header & Navigation", label: "Nav: Gallery", default: "Gallery" },
  { key: "nav.partners", group: "Header & Navigation", label: "Nav: Partners & Sponsors", default: "Collabs" },
  { key: "nav.faq", group: "Header & Navigation", label: "Nav: FAQ", default: "FAQ" },
  { key: "nav.admin", group: "Header & Navigation", label: "Nav: Admin (hidden)", default: "Admin" },
  { key: "header.cta", group: "Header & Navigation", label: "Header CTA button", default: "Apply Now" },
  { key: "brand.suffix", group: "Header & Navigation", label: "Brand tagline (footer)", default: "Innovate Beyond Boundaries" },

  // Hero
  { key: "hero.chip", group: "Hero", label: "Chip", default: "Multidisciplinary Innovation Hackathon" },
  { key: "hero.title.pre", group: "Hero", label: "Title (pre)", default: "SETA" },
  { key: "hero.title.brand", group: "Hero", label: "Title (highlight)", default: "HACK" },
  { key: "hero.subtitle", group: "Hero", label: "Subtitle paragraph", multiline: true, default: "We bring builders, innovators, and future changemakers together every year to explore the intersection of space, energy, sustainability, and technology — developing impactful prototypes, applications, and solutions for tomorrow's challenges." },
  { key: "hero.cta", group: "Hero", label: "CTA button", default: "Apply Now" },
  { key: "hero.f1.title", group: "Hero", label: "Feature 1 title", default: "Real-World Impact" },
  { key: "hero.f1.text", group: "Hero", label: "Feature 1 text", multiline: true, default: "Build meaningful prototypes, applications, and solutions that tackle real challenges." },
  { key: "hero.f2.title", group: "Hero", label: "Feature 2 title", default: "Expert Mentorship" },
  { key: "hero.f2.text", group: "Hero", label: "Feature 2 text", multiline: true, default: "Work alongside mentors, researchers, engineers, and industry professionals throughout your journey." },
  { key: "hero.f3.title", group: "Hero", label: "Feature 3 title", default: "Innovation Beyond Competition" },
  { key: "hero.f3.text", group: "Hero", label: "Feature 3 text", multiline: true, default: "More than a hackathon — an experience to learn, collaborate, and become part of a lasting innovation community." },

  // About
  { key: "about.chip", group: "About", label: "Chip", default: "About" },
  { key: "about.title.pre", group: "About", label: "Title (pre)", default: "The Vision Behind" },
  { key: "about.title.brand", group: "About", label: "Title (highlight)", default: "SETA HACK" },
  { key: "about.p1", group: "About", label: "Paragraph 1", multiline: true, default: "The future will be shaped by those who can connect disciplines, think creatively, and solve complex global challenges." },
  { key: "about.p2", group: "About", label: "Paragraph 2", multiline: true, default: "However, opportunities that integrate Space, Energy, Sustainability, and Technology within a single innovation experience remain limited." },
  { key: "about.p3", group: "About", label: "Paragraph 3", multiline: true, default: "SETA HACK was created to bridge this gap by providing a platform where students and innovators can explore emerging fields, collaborate across disciplines, and develop solutions that address real-world challenges." },
  { key: "about.p4", group: "About", label: "Paragraph 4", multiline: true, default: "Our mission is not only to host a hackathon, but to inspire a generation of innovators capable of shaping a smarter and more sustainable future." },
  { key: "about.tags", group: "About", label: "Tags (one per line)", multiline: true, default: "Mentorship\nWorkshops\nHands-on Learning\nCommunity\nPost-Hack Growth" },

  // Domains
  { key: "domains.chip", group: "Core Domains", label: "Chip", default: "Core Domains" },
  { key: "domains.title.pre", group: "Core Domains", label: "Title (pre)", default: "Four fields." },
  { key: "domains.title.brand", group: "Core Domains", label: "Title (highlight)", default: "One frontier." },
  { key: "domains.d1.title", group: "Core Domains", label: "Domain 1 title", default: "Astronomy & Space" },
  { key: "domains.d1.text", group: "Core Domains", label: "Domain 1 text", multiline: true, default: "Explore challenges inspired by space exploration, astronomy, and scientific discovery." },
  { key: "domains.d2.title", group: "Core Domains", label: "Domain 2 title", default: "Energy" },
  { key: "domains.d2.text", group: "Core Domains", label: "Domain 2 text", multiline: true, default: "Develop innovative solutions for renewable energy, efficiency, and future energy systems." },
  { key: "domains.d3.title", group: "Core Domains", label: "Domain 3 title", default: "Sustainability" },
  { key: "domains.d3.text", group: "Core Domains", label: "Domain 3 text", multiline: true, default: "Address environmental and climate challenges through sustainable innovation." },
  { key: "domains.d4.title", group: "Core Domains", label: "Domain 4 title", default: "Technology & AI" },
  { key: "domains.d4.text", group: "Core Domains", label: "Domain 4 text", multiline: true, default: "Leverage technology, programming, and artificial intelligence to create meaningful impact." },

  // Journey
  { key: "journey.chip", group: "Innovation Journey", label: "Chip", default: "Innovation Journey" },
  { key: "journey.title.pre", group: "Innovation Journey", label: "Title (pre)", default: "SETA HACK" },
  { key: "journey.title.brand", group: "Innovation Journey", label: "Title (highlight)", default: "Innovation Journey" },
  { key: "journey.subtitle", group: "Innovation Journey", label: "Subtitle", default: "Three days. One trajectory from idea to impact." },
  { key: "journey.day1.label", group: "Innovation Journey", label: "Day 1 label", default: "Day 1" },
  { key: "journey.day1.title", group: "Innovation Journey", label: "Day 1 title", default: "Launch & Learning" },
  { key: "journey.day1.subtitle", group: "Innovation Journey", label: "Day 1 subtitle", default: "Kickoff + Knowledge Boost" },
  { key: "journey.day1.items", group: "Innovation Journey", label: "Day 1 items (one per line)", multiline: true, default: "Opening ceremony\nSessions per category: Space 🌌 · Energy ⚡️ · Sustainability 🌱 · Technology 💻\nDesign Thinking workshop\nTeam activities & brainstorming\nMentor check-ins" },
  { key: "journey.day2.label", group: "Innovation Journey", label: "Day 2 label", default: "Day 2" },
  { key: "journey.day2.title", group: "Innovation Journey", label: "Day 2 title", default: "Build & Explore" },
  { key: "journey.day2.subtitle", group: "Innovation Journey", label: "Day 2 subtitle", default: "Execution Day" },
  { key: "journey.day2.items", group: "Innovation Journey", label: "Day 2 items (one per line)", multiline: true, default: "Full development time\nMentor support sessions\nTesting & iteration\nActivities & breaks\n🔭 Optional: telescope observation night" },
  { key: "journey.day3.label", group: "Innovation Journey", label: "Day 3 label", default: "Day 3" },
  { key: "journey.day3.title", group: "Innovation Journey", label: "Day 3 title", default: "Finalize & Pitch" },
  { key: "journey.day3.subtitle", group: "Innovation Journey", label: "Day 3 subtitle", default: "Delivery Day" },
  { key: "journey.day3.items", group: "Innovation Journey", label: "Day 3 items (one per line)", multiline: true, default: "Final touches\nSubmission upload\nPitch preparation\nPresentations\nJury evaluation\nWinners announcement 🏆" },

  // Tracks
  { key: "tracks.chip", group: "Competition Tracks", label: "Chip", default: "Challenges" },
  { key: "tracks.title.pre", group: "Competition Tracks", label: "Title (pre)", default: "Challenges" },
  { key: "tracks.title.brand", group: "Competition Tracks", label: "Title (highlight)", default: "Coming Soon" },
  { key: "tracks.exploreCta", group: "Competition Tracks", label: "Explore Challenges CTA", default: "Explore Challenges" },
  { key: "tracks.t1.title", group: "Competition Tracks", label: "Track 1 title", default: "Astronomy & Space Track" },
  { key: "tracks.t1.text", group: "Competition Tracks", label: "Track 1 text", multiline: true, default: "Solve a challenge related to space, astronomy, or scientific exploration." },
  { key: "tracks.t1.note", group: "Competition Tracks", label: "Track 1 note", multiline: true, default: "In this track, the problem will be predefined, and participants will focus on understanding and solving the assigned challenge." },
  { key: "tracks.t2.title", group: "Competition Tracks", label: "Track 2 title", default: "Sustainability Track" },
  { key: "tracks.t2.text", group: "Competition Tracks", label: "Track 2 text", multiline: true, default: "Develop innovative solutions for environmental and sustainability challenges." },
  { key: "tracks.t2.note", group: "Competition Tracks", label: "Track 2 note", multiline: true, default: "Each team will be given a specific real-world sustainability problem to analyze and solve." },
  { key: "tracks.t3.title", group: "Competition Tracks", label: "Track 3 title", default: "Energy Track" },
  { key: "tracks.t3.text", group: "Competition Tracks", label: "Track 3 text", multiline: true, default: "Address challenges related to renewable energy, efficiency, and future energy systems." },
  { key: "tracks.t3.note", group: "Competition Tracks", label: "Track 3 note", multiline: true, default: "Participants will work on a defined energy-related problem provided during the hackathon." },
  { key: "tracks.t4.title", group: "Competition Tracks", label: "Track 4 title", default: "Technology & AI Track" },
  { key: "tracks.t4.text", group: "Competition Tracks", label: "Track 4 text", multiline: true, default: "Create technology-driven solutions for real-world problems using software, data, or AI." },
  { key: "tracks.t4.note", group: "Competition Tracks", label: "Track 4 note", multiline: true, default: "Teams will receive a specific problem to solve using technological approaches." },
  { key: "tracks.innov.chip", group: "Competition Tracks", label: "Innovation chip", default: "Innovation Track" },
  { key: "tracks.innov.title", group: "Competition Tracks", label: "Innovation title", default: "Interdisciplinary Challenge" },
  { key: "tracks.innov.text", group: "Competition Tracks", label: "Innovation text", multiline: true, default: "Identify a problem you are passionate about and develop a solution that integrates two or more of SETA HACK's core domains. This track gives participants full creative freedom to define both the problem and the solution." },

  // Home gallery preview
  { key: "gpreview.chip", group: "Home Gallery Preview", label: "Chip", default: "Gallery" },
  { key: "gpreview.title.pre", group: "Home Gallery Preview", label: "Title (pre)", default: "Moments from" },
  { key: "gpreview.title.brand", group: "Home Gallery Preview", label: "Title (highlight)", default: "every edition" },
  { key: "gpreview.subtitle", group: "Home Gallery Preview", label: "Subtitle", default: "A glimpse into the journeys, breakthroughs, and celebrations of SETA HACK." },
  { key: "gpreview.cta", group: "Home Gallery Preview", label: "View full gallery CTA", default: "View full gallery" },
  { key: "gpreview.collectionChip", group: "Home Gallery Preview", label: "Card chip label", default: "Collection" },

  // Partners
  { key: "partners.chip", group: "Partners", label: "Chip", default: "Partners & Sponsors" },
  { key: "partners.title.pre", group: "Partners", label: "Title (pre)", default: "Powered by" },
  { key: "partners.title.brand", group: "Partners", label: "Title (highlight)", default: "visionaries" },
  { key: "partners.subtitle", group: "Partners", label: "Subtitle", default: "Forward-looking organizations fueling the next generation of innovators. Hosted by Canadian International College." },
  { key: "partners.slotLabel", group: "Partners", label: "Slot placeholder text", default: "Sponsor" },
  { key: "partners.hostedBy", group: "Partners", label: "Hosted by chip", default: "Hosted by" },

  // FAQ
  { key: "faq.chip", group: "FAQ", label: "Chip", default: "FAQ" },
  { key: "faq.title.pre", group: "FAQ", label: "Title (pre)", default: "Questions," },
  { key: "faq.title.brand", group: "FAQ", label: "Title (highlight)", default: "answered" },
  { key: "faq.q1", group: "FAQ", label: "Q1", default: "Who can participate?" },
  { key: "faq.a1", group: "FAQ", label: "A1", multiline: true, default: "High school students, university students, and young innovators." },
  { key: "faq.q2", group: "FAQ", label: "Q2", default: "Can I participate individually?" },
  { key: "faq.a2", group: "FAQ", label: "A2", multiline: true, default: "Yes. Individual registration is available." },
  { key: "faq.q3", group: "FAQ", label: "Q3", default: "What if I don't have a team?" },
  { key: "faq.a3", group: "FAQ", label: "A3", multiline: true, default: "Our Team Matching Program will help connect participants with suitable teammates." },
  { key: "faq.q4", group: "FAQ", label: "Q4", default: "What is the maximum team size?" },
  { key: "faq.a4", group: "FAQ", label: "A4", multiline: true, default: "Up to 5 members." },
  { key: "faq.q5", group: "FAQ", label: "Q5", default: "Will there be an online edition?" },
  { key: "faq.a5", group: "FAQ", label: "A5", multiline: true, default: "Yes, an online participation option will be available for participants from other governorates and countries." },

  // Apply
  { key: "apply.title", group: "Apply", label: "Title", default: "Apply Now" },
  { key: "apply.body", group: "Apply", label: "Body", multiline: true, default: "Join SETA HACK and become part of a new generation of innovators creating solutions for the future." },
  { key: "apply.cta", group: "Apply", label: "CTA button", default: "Apply Now" },

  // Footer
  { key: "footer.email", group: "Footer", label: "Contact email", default: "setahackathon@gmail.com" },
  { key: "footer.copyright", group: "Footer", label: "Copyright line", default: "© 2026 SETA HACK. Hosted by Canadian International College (CIC). All rights reserved." },

  // Gallery page
  { key: "galleryPage.chip", group: "Gallery Page", label: "Chip", default: "Gallery" },
  { key: "galleryPage.title.pre", group: "Gallery Page", label: "Title (pre)", default: "Every edition," },
  { key: "galleryPage.title.brand", group: "Gallery Page", label: "Title (highlight)", default: "every moment" },
  { key: "galleryPage.subtitle", group: "Gallery Page", label: "Subtitle", default: "Explore our collections and relive SETA HACK through photos and stories." },
  { key: "galleryPage.empty", group: "Gallery Page", label: "Empty state", default: "No collections yet — check back soon." },
  { key: "galleryPage.loading", group: "Gallery Page", label: "Loading label", default: "Loading…" },
  { key: "galleryPage.back", group: "Gallery Page", label: "Back to home link", default: "← Back to home" },
  { key: "galleryPage.allCollections", group: "Gallery Page", label: "All collections link", default: "All collections" },
  { key: "galleryPage.collectionChip", group: "Gallery Page", label: "Collection chip", default: "Collection" },
  { key: "galleryPage.viewCta", group: "Gallery Page", label: "Card view CTA", default: "View gallery" },
  { key: "galleryPage.itemsEmpty", group: "Gallery Page", label: "No items yet", default: "No items yet." },
];

export const DEFAULTS: Record<string, string> = Object.fromEntries(
  CONTENT_FIELDS.map((f) => [f.key, f.default])
);

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

type Ctx = {
  values: Record<string, string>;
  reload: () => Promise<void>;
};

const SiteContentCtx = createContext<Ctx>({ values: {}, reload: async () => {} });

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    const { data } = await supabase.from("site_content").select("key,value");
    const map: Record<string, string> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    setValues(map);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const ctx = useMemo(() => ({ values, reload }), [values, reload]);
  return <SiteContentCtx.Provider value={ctx}>{children}</SiteContentCtx.Provider>;
}

export function useSiteContent() {
  return useContext(SiteContentCtx);
}

/** Read a single text by key, with default fallback. */
export function useText(key: string, fallback?: string): string {
  const { values } = useContext(SiteContentCtx);
  const v = values[key];
  if (v !== undefined && v !== "") return v;
  return fallback ?? DEFAULTS[key] ?? "";
}

/** Render a text node bound to a content key. Falls back to children or default. */
export function T({ k, children }: { k: string; children?: string }) {
  const value = useText(k, children ?? DEFAULTS[k] ?? "");
  return <>{value}</>;
}

/** Split a multiline value into non-empty lines. */
export function useLines(key: string, fallback?: string): string[] {
  const v = useText(key, fallback);
  return v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}
