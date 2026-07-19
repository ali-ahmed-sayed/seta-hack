import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

import {
  fetchCollections,
  fetchItems,
  refreshSignedUrl,
  type Collection,
  type GalleryItem,
  type ItemImage,
} from "@/lib/gallery";
import { X, ChevronLeft, ChevronRight, ArrowLeft, ImageIcon } from "lucide-react";
import { useText } from "@/lib/site-content";


export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — SETA HACK" },
      { name: "description", content: "Browse SETA HACK collections: photos, moments, and highlights from every edition." },
      { property: "og:title", content: "Gallery — SETA HACK" },
      { property: "og:description", content: "Photos and highlights from every SETA HACK edition." },
    ],
  }),
  component: GalleryPage,
});

type FullItem = GalleryItem & { images: ItemImage[] };

function GalleryPage() {
  const chip = useText("galleryPage.chip");
  const titlePre = useText("galleryPage.title.pre");
  const titleBrand = useText("galleryPage.title.brand");
  const subtitle = useText("galleryPage.subtitle");
  const emptyLabel = useText("galleryPage.empty");
  const loadingLabel = useText("galleryPage.loading");
  const backLabel = useText("galleryPage.back");
  const allLabel = useText("galleryPage.allCollections");
  const collectionChip = useText("galleryPage.collectionChip");
  const viewCta = useText("galleryPage.viewCta");
  const itemsEmpty = useText("galleryPage.itemsEmpty");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState<Collection | null>(null);
  const [items, setItems] = useState<FullItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ item: FullItem; index: number } | null>(null);


  useEffect(() => {
    setLoading(true);
    fetchCollections()
      .then(setCollections)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetchItems(selected.id).then(async (rows) => {
      // refresh signed URLs
      const refreshed = await Promise.all(
        rows.map(async (r) => ({
          ...r,
          images: await Promise.all(
            r.images.map(async (im) =>
              im.storage_path
                ? { ...im, image_url: (await refreshSignedUrl(im.storage_path)) || im.image_url }
                : im
            )
          ),
        }))
      );
      setItems(refreshed);
    });
  }, [selected]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") shift(1);
      if (e.key === "ArrowLeft") shift(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  function shift(dir: number) {
    if (!lightbox) return;
    const n = lightbox.item.images.length;
    setLightbox({ ...lightbox, index: (lightbox.index + dir + n) % n });
  }

  return (
    <div className="relative min-h-screen">
      
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16">
        {!selected ? (
          <>
            <div className="mb-10 text-center">
              <span className="chip">{chip}</span>
              <h1 className="font-display mt-6 text-4xl font-semibold sm:text-6xl">
                <span className="text-gradient">{titlePre}</span> {titleBrand}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                {subtitle}
              </p>
            </div>
            {loading ? (
              <p className="text-center text-muted-foreground">{loadingLabel}</p>
            ) : collections.length === 0 ? (
              <div className="glass mx-auto max-w-lg rounded-3xl p-10 text-center">
                <ImageIcon className="mx-auto h-10 w-10 text-cyan/60" />
                <p className="mt-4 text-muted-foreground">{emptyLabel}</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="glass hover-lift group text-left overflow-hidden rounded-3xl p-7"
                  >
                    <div className="chip mb-4">{collectionChip}</div>
                    <h3 className="font-display text-2xl font-semibold group-hover:text-cyan">
                      {c.title}
                    </h3>
                    {c.description && (
                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                        {c.description}
                      </p>
                    )}
                    <div className="mt-6 inline-flex items-center gap-2 text-sm text-cyan">
                      {viewCta} <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-16 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-cyan">
                {backLabel}
              </Link>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setSelected(null);
                setItems([]);
              }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan"
            >
              <ArrowLeft className="h-4 w-4" /> {allLabel}
            </button>
            <div className="mt-6">
              <span className="chip">{collectionChip}</span>
              <h1 className="font-display mt-4 text-4xl font-semibold sm:text-5xl">
                {selected.title}
              </h1>
              {selected.description && (
                <p className="mt-3 max-w-2xl text-muted-foreground">{selected.description}</p>
              )}
            </div>
            {items.length === 0 ? (
              <p className="mt-16 text-center text-muted-foreground">{itemsEmpty}</p>
            ) : (

              <div className="mt-10 space-y-14">
                {items.map((it) => (
                  <article key={it.id}>
                    <header className="mb-4">
                      {it.title && (
                        <h2 className="font-display text-2xl font-semibold">{it.title}</h2>
                      )}
                      {it.item_date && (
                        <p className="mt-1 text-xs uppercase tracking-widest text-cyan/70">
                          {new Date(it.item_date).toLocaleDateString()}
                        </p>
                      )}
                      {it.description && (
                        <p className="mt-3 max-w-3xl whitespace-pre-line text-sm text-foreground/80">
                          {it.description}
                        </p>
                      )}
                    </header>
                    {it.images.length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {it.images.map((im, idx) => (
                          <button
                            key={im.id}
                            onClick={() => setLightbox({ item: it, index: idx })}
                            className="group relative overflow-hidden rounded-2xl border border-border/40 bg-black/30"
                          >
                            <img
                              src={im.image_url}
                              alt=""
                              loading="lazy"
                              className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-4 backdrop-blur"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {lightbox.item.images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  shift(-1);
                }}
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  shift(1);
                }}
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div
            className="max-h-[85vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.item.images[lightbox.index].image_url}
              alt=""
              className="max-h-[75vh] w-auto rounded-xl object-contain"
            />
            {(lightbox.item.title || lightbox.item.description) && (
              <div className="mt-4 max-w-3xl text-center text-sm text-white/80">
                {lightbox.item.title && (
                  <p className="font-display text-lg text-white">{lightbox.item.title}</p>
                )}
                {lightbox.item.description && (
                  <p className="mt-1 whitespace-pre-line text-white/70">
                    {lightbox.item.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
