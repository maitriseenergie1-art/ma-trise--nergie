begin;

-- ---------------------------------------------------------------------------
-- Content schema: case studies (réalisations) and blog.
--
-- Public browser roles (anon) get read-only access to *published* rows.
-- All writes go through a privileged server context (Netlify Function using the
-- service_role key), so no write policy is defined for browser roles.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Case studies (réalisations)
-- ---------------------------------------------------------------------------
create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) between 1 and 200),
  sector text not null,
  tags text[] not null default '{}',
  summary text not null check (length(summary) between 1 and 400),
  -- Structured story sections rendered on the detail page.
  problem text,
  diagnosis text,
  solution text,
  works text,
  results text,
  -- Key figures shown as a metrics grid: [{label, value, detail}]
  metrics jsonb not null default '[]'::jsonb,
  location text,
  cover_image_url text,
  cover_image_alt text,
  gallery jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text check (seo_description is null or length(seo_description) <= 320),
  status text not null default 'draft' check (status in ('draft', 'published')),
  indexable boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_studies_metrics_is_array check (jsonb_typeof(metrics) = 'array'),
  constraint case_studies_gallery_is_array check (jsonb_typeof(gallery) = 'array'),
  constraint case_studies_published_has_date check (status <> 'published' or published_at is not null)
);

create index case_studies_published_idx on public.case_studies (published_at desc)
  where status = 'published';
create index case_studies_sector_idx on public.case_studies (sector)
  where status = 'published';
create index case_studies_tags_idx on public.case_studies using gin (tags);

create trigger case_studies_set_updated_at
before update on public.case_studies
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------------
create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) between 1 and 120),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger blog_categories_set_updated_at
before update on public.blog_categories
for each row execute function public.set_updated_at();

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) between 1 and 200),
  excerpt text not null check (length(excerpt) between 1 and 400),
  -- Article body authored as Markdown.
  body_markdown text not null default '',
  category_id uuid references public.blog_categories (id) on delete set null,
  tags text[] not null default '{}',
  author_name text not null default 'Maîtrise Énergie',
  cover_image_url text,
  cover_image_alt text,
  reading_minutes integer check (reading_minutes is null or reading_minutes between 1 and 120),
  seo_title text,
  seo_description text check (seo_description is null or length(seo_description) <= 320),
  status text not null default 'draft' check (status in ('draft', 'published')),
  indexable boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(body_markdown, '')), 'C')
  ) stored,
  constraint blog_posts_published_has_date check (status <> 'published' or published_at is not null)
);

create index blog_posts_published_idx on public.blog_posts (published_at desc)
  where status = 'published';
create index blog_posts_category_id_idx on public.blog_posts (category_id);
create index blog_posts_tags_idx on public.blog_posts using gin (tags);
create index blog_posts_search_idx on public.blog_posts using gin (search_vector);

create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — public read of published rows only.
-- ---------------------------------------------------------------------------
alter table public.case_studies enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;

create policy case_studies_public_read on public.case_studies
  for select to anon, authenticated
  using (status = 'published');

create policy blog_categories_public_read on public.blog_categories
  for select to anon, authenticated
  using (true);

create policy blog_posts_public_read on public.blog_posts
  for select to anon, authenticated
  using (status = 'published');

grant select on public.case_studies to anon, authenticated;
grant select on public.blog_categories to anon, authenticated;
grant select on public.blog_posts to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket for content images. Public read; writes happen server-side
-- with the service_role key, which bypasses storage RLS.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images', 'content-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do nothing;

create policy "content images public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'content-images');

commit;
