import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

import { supabase } from "@/integrations/supabase/client";
import {
  useSiteContent,
  CONTENT_FIELDS,
  type ContentField,
} from "@/lib/site-content";

import {
  fetchCollections,
  fetchItems,
  isCurrentUserAdmin,
  uploadImage,
  deleteStorageObject,
  refreshSignedUrl,
  type Collection,
  type GalleryItem,
  type ItemImage,
} from "@/lib/gallery";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  Save,
  LogOut,
  ImagePlus,
  GripVertical,
  X,
  Edit3,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — SETA HACK" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type FullItem = GalleryItem & { images: ItemImage[] };
type AuthState = "loading" | "signed-out" | "not-admin" | "admin";

function AdminPage() {
  const [state, setState] = useState<AuthState>("loading");

  async function evaluate() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setState("signed-out");
      return;
    }
    const admin = await isCurrentUserAdmin();
    setState(admin ? "admin" : "not-admin");
  }

  useEffect(() => {
    evaluate();
    const { data: sub } = supabase.auth.onAuthStateChange(() => evaluate());
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="relative min-h-screen">
      
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        {state === "loading" && <p className="text-center text-muted-foreground">Loading…</p>}
        {state === "signed-out" && <SignInCard />}
        {state === "not-admin" && <NotAuthorized />}
        {state === "admin" && <AdminDashboard />}
      </main>
    </div>
  );
}

function SignInCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) setErr(error.message);
    setLoading(false);
  }

  return (
    <div className="glass mx-auto max-w-md rounded-3xl p-8">
      <h1 className="font-display text-2xl font-semibold">Admin sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your admin email and password to continue.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-cyan"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 pr-12 text-sm outline-none focus:border-cyan"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-cyan"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button disabled={loading} className="btn-primary w-full justify-center">
          {loading ? "Please wait…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function NotAuthorized() {
  return (
    <div className="glass mx-auto max-w-md rounded-3xl p-8 text-center">
      <h1 className="font-display text-2xl font-semibold">Not authorized</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This account does not have admin access.
      </p>
      <button
        onClick={() => supabase.auth.signOut()}
        className="btn-primary mx-auto mt-6 justify-center text-sm"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState<"gallery" | "content">("gallery");

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage gallery collections and every text label on the site.
          </p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="glass rounded-full px-4 py-2 text-sm text-foreground/80 hover:text-cyan"
        >
          <LogOut className="mr-1 inline h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="glass mb-6 inline-flex rounded-full p-1">
        {[
          { id: "gallery", label: "Gallery" },
          { id: "content", label: "Site content" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as "gallery" | "content")}
            className={`rounded-full px-5 py-2 text-sm transition ${
              tab === t.id ? "bg-cyan/20 text-cyan" : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "gallery" ? <GalleryManager /> : <ContentEditor />}
    </div>
  );
}

function GalleryManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  async function reload() {
    const rows = await fetchCollections();
    setCollections(rows);
    if (!activeId && rows[0]) setActiveId(rows[0].id);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createCollection() {
    const title = prompt("Collection title (e.g. SETA Hack 2026)");
    if (!title) return;
    const { data, error } = await supabase
      .from("gallery_collections")
      .insert({ title, description: "", sort_order: collections.length })
      .select()
      .single();
    if (error) return alert(error.message);
    setCollections((c) => [...c, data as Collection]);
    setActiveId(data.id);
  }

  const active = collections.find((c) => c.id === activeId) ?? null;

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <aside className="glass rounded-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Collections
          </h2>
          <button
            onClick={createCollection}
            className="grid h-8 w-8 place-items-center rounded-full bg-cyan/20 text-cyan hover:bg-cyan/30"
            aria-label="New collection"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <ul className="space-y-1">
          {collections.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                  c.id === activeId
                    ? "bg-cyan/15 text-cyan"
                    : "text-foreground/80 hover:bg-white/5"
                }`}
              >
                <span className="truncate">{c.title}</span>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </button>
            </li>
          ))}
          {collections.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No collections yet.</p>
          )}
        </ul>
      </aside>

      <section>
        {active ? (
          <CollectionEditor
            key={active.id}
            collection={active}
            onChange={reload}
            onDelete={() => {
              setActiveId(null);
              reload();
            }}
          />
        ) : (
          <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
            Select or create a collection.
          </div>
        )}
      </section>
    </div>
  );
}

function ContentEditor() {
  const { values, reload } = useSiteContent();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const f of CONTENT_FIELDS) {
      next[f.key] = values[f.key] ?? f.default;
    }
    setDrafts(next);
  }, [values]);

  async function saveField(key: string) {
    const value = drafts[key] ?? "";
    setSavingKey(key);
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value }, { onConflict: "key" });
    setSavingKey(null);
    if (error) {
      alert(error.message);
      return;
    }
    setSavedKey(key);
    setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 1500);
    await reload();
  }

  async function resetField(field: ContentField) {
    if (!confirm(`Reset "${field.label}" to its default text?`)) return;
    setSavingKey(field.key);
    await supabase.from("site_content").delete().eq("key", field.key);
    setSavingKey(null);
    setDrafts((d) => ({ ...d, [field.key]: field.default }));
    await reload();
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? CONTENT_FIELDS.filter(
        (f) =>
          f.label.toLowerCase().includes(q) ||
          f.group.toLowerCase().includes(q) ||
          f.key.toLowerCase().includes(q) ||
          (drafts[f.key] ?? "").toLowerCase().includes(q)
      )
    : CONTENT_FIELDS;

  const groups: Record<string, ContentField[]> = {};
  for (const f of filtered) (groups[f.group] ||= []).push(f);

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Site content</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Edit any text label on the site. Changes go live immediately.
            </p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search labels…"
            className="w-full max-w-xs rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm outline-none focus:border-cyan sm:w-64"
          />
        </div>
      </div>

      {Object.keys(groups).length === 0 && (
        <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
          No fields match your search.
        </div>
      )}

      {Object.entries(groups).map(([group, fields]) => (
        <div key={group} className="glass rounded-3xl p-6">
          <h3 className="font-display text-lg font-semibold">{group}</h3>
          <div className="mt-5 grid gap-5">
            {fields.map((f) => {
              const value = drafts[f.key] ?? "";
              const isSaving = savingKey === f.key;
              const isSaved = savedKey === f.key;
              const isDirty = value !== (values[f.key] ?? f.default);
              return (
                <div key={f.key} className="rounded-2xl border border-border/40 bg-background/40 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <label className="text-sm font-medium">{f.label}</label>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                      {f.key}
                    </span>
                  </div>
                  {f.multiline ? (
                    <textarea
                      value={value}
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [f.key]: e.target.value }))
                      }
                      rows={Math.min(8, Math.max(3, value.split("\n").length + 1))}
                      className="mt-2 w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-cyan"
                    />
                  ) : (
                    <input
                      value={value}
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [f.key]: e.target.value }))
                      }
                      className="mt-2 w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-cyan"
                    />
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => saveField(f.key)}
                      disabled={!isDirty || isSaving}
                      className="btn-primary text-xs disabled:opacity-40"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {isSaving ? "Saving…" : isSaved ? "Saved" : "Save"}
                    </button>
                    <button
                      onClick={() => resetField(f)}
                      className="rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-cyan"
                    >
                      Reset to default
                    </button>
                    {isDirty && !isSaving && (
                      <span className="text-xs text-cyan/70">Unsaved changes</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}


function CollectionEditor({
  collection,
  onChange,
  onDelete,
}: {
  collection: Collection;
  onChange: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description ?? "");
  const [items, setItems] = useState<FullItem[]>([]);
  const [saving, setSaving] = useState(false);

  async function reloadItems() {
    const rows = await fetchItems(collection.id);
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
  }

  useEffect(() => {
    setTitle(collection.title);
    setDescription(collection.description ?? "");
    reloadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection.id]);

  async function saveMeta() {
    setSaving(true);
    const { error } = await supabase
      .from("gallery_collections")
      .update({ title, description, updated_at: new Date().toISOString() })
      .eq("id", collection.id);
    setSaving(false);
    if (error) return alert(error.message);
    onChange();
  }

  async function removeCollection() {
    if (!confirm(`Delete "${collection.title}" and all its items?`)) return;
    const { error } = await supabase
      .from("gallery_collections")
      .delete()
      .eq("id", collection.id);
    if (error) return alert(error.message);
    onDelete();
  }

  async function addItem() {
    const { data, error } = await supabase
      .from("gallery_items")
      .insert({
        collection_id: collection.id,
        title: "New item",
        description: "",
        sort_order: items.length,
      })
      .select()
      .single();
    if (error) return alert(error.message);
    setItems((s) => [...s, { ...(data as GalleryItem), images: [] }]);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIdx, newIdx);
    setItems(next);
    await Promise.all(
      next.map((it, i) =>
        supabase.from("gallery_items").update({ sort_order: i }).eq("id", it.id)
      )
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Collection details</h2>
          <button
            onClick={removeCollection}
            className="rounded-full px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="mr-1 inline h-3.5 w-3.5" /> Delete
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-cyan"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-cyan"
          />
          <button onClick={saveMeta} disabled={saving} className="btn-primary self-start text-sm">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Items</h2>
          <button onClick={addItem} className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> Add item
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No items yet.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <ul className="mt-6 space-y-4">
                {items.map((it) => (
                  <ItemRow
                    key={it.id}
                    item={it}
                    onChanged={reloadItems}
                    onRemoved={() => setItems((s) => s.filter((x) => x.id !== it.id))}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function ItemRow({
  item,
  onChanged,
  onRemoved,
}: {
  item: FullItem;
  onChanged: () => void;
  onRemoved: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [date, setDate] = useState(item.item_date ?? "");
  const [uploading, setUploading] = useState(false);

  async function save() {
    const { error } = await supabase
      .from("gallery_items")
      .update({
        title,
        description,
        item_date: date || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);
    if (error) return alert(error.message);
    setEditing(false);
    onChanged();
  }

  async function remove() {
    if (!confirm("Delete this item and all its images?")) return;
    for (const im of item.images) {
      if (im.storage_path) await deleteStorageObject(im.storage_path);
    }
    const { error } = await supabase.from("gallery_items").delete().eq("id", item.id);
    if (error) return alert(error.message);
    onRemoved();
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const MAX = 10;
    const remaining = MAX - item.images.length;
    if (remaining <= 0) {
      alert(`Each gallery item can have at most ${MAX} photos.`);
      return;
    }
    const list = Array.from(files);
    if (list.length > remaining) {
      alert(
        `Each gallery item can have at most ${MAX} photos. Only the first ${remaining} will be uploaded.`
      );
    }
    const toUpload = list.slice(0, remaining);
    setUploading(true);
    try {
      let idx = item.images.length;
      for (const f of toUpload) {
        const { path, url } = await uploadImage(f);
        const { error } = await supabase.from("gallery_item_images").insert({
          item_id: item.id,
          image_url: url,
          storage_path: path,
          sort_order: idx++,
        });
        if (error) throw error;
      }
      onChanged();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  }


  async function removeImage(im: ItemImage) {
    if (!confirm("Delete this image?")) return;
    if (im.storage_path) await deleteStorageObject(im.storage_path);
    await supabase.from("gallery_item_images").delete().eq("id", im.id);
    onChanged();
  }

  async function replaceImage(im: ItemImage, file: File) {
    const { path, url } = await uploadImage(file);
    if (im.storage_path) await deleteStorageObject(im.storage_path);
    await supabase
      .from("gallery_item_images")
      .update({ image_url: url, storage_path: path })
      .eq("id", im.id);
    onChanged();
  }

  return (
    <li ref={setNodeRef} style={style} className="rounded-2xl border border-border/40 bg-background/40 p-4">
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-muted-foreground hover:text-cyan"
          aria-label="Drag"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-cyan"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={3}
                className="w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-cyan"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-cyan"
              />
              <div className="flex gap-2">
                <button onClick={save} className="btn-primary text-xs">
                  <Save className="h-3.5 w-3.5" /> Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold">{item.title || "Untitled"}</h3>
                  {item.item_date && (
                    <p className="text-xs text-cyan/70">
                      {new Date(item.item_date).toLocaleDateString()}
                    </p>
                  )}
                  {item.description && (
                    <p className="mt-2 whitespace-pre-line text-sm text-foreground/80">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(true)}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-white/5 hover:text-cyan"
                    aria-label="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={remove}
                    className="grid h-8 w-8 place-items-center rounded-full text-red-400 hover:bg-red-500/10"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Images{" "}
                <span className="text-muted-foreground/70">
                  ({item.images.length}/10)
                </span>
              </p>
              <label
                className={`cursor-pointer rounded-full bg-cyan/20 px-3 py-1.5 text-xs text-cyan hover:bg-cyan/30 ${
                  item.images.length >= 10 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <ImagePlus className="mr-1 inline h-3.5 w-3.5" />
                {uploading ? "Uploading…" : item.images.length >= 10 ? "Limit reached" : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  disabled={item.images.length >= 10}
                  onChange={(e) => onFiles(e.target.files)}
                />
              </label>
            </div>

            {item.images.length === 0 ? (
              <p className="text-xs text-muted-foreground">No images yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {item.images.map((im) => (
                  <div key={im.id} className="group relative overflow-hidden rounded-lg border border-border/40">
                    <img src={im.image_url} alt="" className="aspect-square w-full object-cover" />
                    <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                      <label className="cursor-pointer rounded-md bg-white/20 px-2 py-1 text-[10px] text-white hover:bg-white/30">
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) =>
                            e.target.files && e.target.files[0] && replaceImage(im, e.target.files[0])
                          }
                        />
                      </label>
                      <button
                        onClick={() => removeImage(im)}
                        className="grid h-6 w-6 place-items-center rounded-md bg-red-500/70 text-white hover:bg-red-500"
                        aria-label="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
