import { supabase } from "@/integrations/supabase/client";

export type Collection = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type GalleryItem = {
  id: string;
  collection_id: string;
  title: string;
  description: string | null;
  item_date: string | null;
  sort_order: number;
  created_at: string;
};

export type ItemImage = {
  id: string;
  item_id: string;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
};

export async function fetchCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("gallery_collections")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchCollection(id: string): Promise<Collection | null> {
  const { data, error } = await supabase
    .from("gallery_collections")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchItems(collectionId: string): Promise<
  (GalleryItem & { images: ItemImage[] })[]
> {
  const { data: items, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("collection_id", collectionId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const ids = (items ?? []).map((i) => i.id);
  if (ids.length === 0) return [];
  const { data: imgs, error: e2 } = await supabase
    .from("gallery_item_images")
    .select("*")
    .in("item_id", ids)
    .order("sort_order", { ascending: true });
  if (e2) throw e2;
  const byItem = new Map<string, ItemImage[]>();
  for (const im of imgs ?? []) {
    const arr = byItem.get(im.item_id) ?? [];
    arr.push(im as ItemImage);
    byItem.set(im.item_id, arr);
  }
  return (items ?? []).map((i) => ({ ...i, images: byItem.get(i.id) ?? [] })) as any;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return false;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", uid)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return !!data;
}

const BUCKET = "gallery-images";
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function uploadImage(file: File): Promise<{ path: string; url: string }> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data, error: signedUrlError } = await supabase.storage.from(BUCKET).createSignedUrl(
    path,
    SIGNED_URL_EXPIRY_SECONDS,
  );
  if (signedUrlError || !data?.signedUrl) {
    throw signedUrlError ?? new Error("Failed to create signed URL for uploaded image.");
  }

  return { path, url: data.signedUrl };
}

export async function refreshSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(
    path,
    SIGNED_URL_EXPIRY_SECONDS,
  );
  if (error || !data?.signedUrl) {
    console.error("Failed to refresh signed image URL:", error?.message ?? "unknown error", path);
    return "";
  }
  return data.signedUrl;
}

export async function deleteStorageObject(path: string) {
  await supabase.storage.from(BUCKET).remove([path]);
}
