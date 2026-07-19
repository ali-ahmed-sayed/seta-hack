
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Auto-grant admin ONLY for the allowed email once its email is confirmed
CREATE OR REPLACE FUNCTION public.grant_seta_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) = 'seta.hackathon.leaders@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created_grant_seta_admin
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.grant_seta_admin();

CREATE TRIGGER on_auth_user_confirmed_grant_seta_admin
AFTER UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW
WHEN (old.email_confirmed_at IS NULL AND new.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_seta_admin();

-- Collections
CREATE TABLE public.gallery_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_collections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_collections TO authenticated;
GRANT ALL ON public.gallery_collections TO service_role;
ALTER TABLE public.gallery_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read collections" ON public.gallery_collections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin insert collections" ON public.gallery_collections FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update collections" ON public.gallery_collections FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete collections" ON public.gallery_collections FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Items
CREATE TABLE public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.gallery_collections(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  item_date date,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read items" ON public.gallery_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin insert items" ON public.gallery_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update items" ON public.gallery_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete items" ON public.gallery_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Images
CREATE TABLE public.gallery_item_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.gallery_items(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  storage_path text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_item_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_item_images TO authenticated;
GRANT ALL ON public.gallery_item_images TO service_role;
ALTER TABLE public.gallery_item_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read images" ON public.gallery_item_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin insert images" ON public.gallery_item_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update images" ON public.gallery_item_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete images" ON public.gallery_item_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
