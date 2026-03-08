create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_cms_user()
returns boolean
language sql
stable
as $$
  select auth.role() = 'authenticated';
$$;

create table if not exists public.site_settings (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profile (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id text primary key,
  title text not null default '',
  subtitle text not null default '',
  category text not null default '',
  services text not null default '',
  client text not null default '',
  year text not null default '',
  image text not null default '',
  image_bg_color text not null default '',
  image_position text not null default '50% 50%',
  gallery_images jsonb not null default '[]'::jsonb,
  gallery_positions jsonb not null default '[]'::jsonb,
  link text not null default '#',
  slug text not null unique,
  description text not null default '',
  content_blocks jsonb not null default '[]'::jsonb,
  password text not null default '',
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  tags text[] not null default '{}'::text[],
  featured boolean not null default false,
  seo_title text not null default '',
  seo_description text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.blog_posts (
  id text primary key,
  title text not null default '',
  subtitle text not null default '',
  publisher text not null default '',
  date text not null default '',
  description text not null default '',
  image text not null default '',
  image_bg_color text not null default '',
  image_position text not null default '50% 50%',
  gallery_images jsonb not null default '[]'::jsonb,
  gallery_positions jsonb not null default '[]'::jsonb,
  content text not null default '',
  content_blocks jsonb not null default '[]'::jsonb,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  tags text[] not null default '{}'::text[],
  featured boolean not null default false,
  author text not null default '',
  read_time text not null default '5 min',
  link text not null default '',
  category text not null default '',
  services text not null default '',
  password text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pages (
  id text primary key,
  title text not null default '',
  slug text not null unique,
  description text not null default '',
  content_blocks jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  seo_title text not null default '',
  seo_description text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.experiences (
  id text primary key,
  location text not null default '',
  company text not null default '',
  period text not null default '',
  role text not null default '',
  tasks text[] not null default '{}'::text[],
  sort_order integer not null default 0
);

create table if not exists public.education (
  id text primary key,
  location text not null default '',
  period text not null default '',
  degree text not null default '',
  university text not null default '',
  description text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.certifications (
  id text primary key,
  title text not null default '',
  issuer text not null default '',
  link text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.stack (
  id text primary key,
  name text not null default '',
  description text not null default '',
  color text not null default '#555555',
  link text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.awards (
  id text primary key,
  title text not null default '',
  issuer text not null default '',
  link text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.recommendations (
  id text primary key,
  name text not null default '',
  role text not null default '',
  quote text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.media (
  id text primary key,
  name text not null default '',
  bucket text not null,
  path text not null,
  visibility text not null check (visibility in ('public', 'private')),
  mime_type text not null default 'application/octet-stream',
  size bigint not null default 0,
  kind text not null check (kind in ('image', 'video', 'file')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists media_bucket_path_idx on public.media (bucket, path);

create table if not exists public.content_versions (
  id text primary key,
  entity_type text not null check (entity_type in ('project', 'blog_post', 'page', 'experience', 'education', 'certification', 'stack', 'award', 'recommendation')),
  entity_id text not null,
  label text not null default '',
  snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists content_versions_entity_idx on public.content_versions (entity_type, entity_id, created_at desc);

drop trigger if exists set_updated_at_site_settings on public.site_settings;
create trigger set_updated_at_site_settings before update on public.site_settings
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_profile on public.profile;
create trigger set_updated_at_profile before update on public.profile
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_projects on public.projects;
create trigger set_updated_at_projects before update on public.projects
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_blog_posts on public.blog_posts;
create trigger set_updated_at_blog_posts before update on public.blog_posts
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_pages on public.pages;
create trigger set_updated_at_pages before update on public.pages
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_media on public.media;
create trigger set_updated_at_media before update on public.media
for each row execute procedure public.set_updated_at();

alter table public.site_settings enable row level security;
alter table public.profile enable row level security;
alter table public.projects enable row level security;
alter table public.blog_posts enable row level security;
alter table public.pages enable row level security;
alter table public.experiences enable row level security;
alter table public.education enable row level security;
alter table public.certifications enable row level security;
alter table public.stack enable row level security;
alter table public.awards enable row level security;
alter table public.recommendations enable row level security;
alter table public.media enable row level security;
alter table public.content_versions enable row level security;

drop policy if exists "public_read_site_settings" on public.site_settings;
create policy "public_read_site_settings" on public.site_settings
for select using (true);

drop policy if exists "cms_manage_site_settings" on public.site_settings;
create policy "cms_manage_site_settings" on public.site_settings
for all using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "public_read_profile" on public.profile;
create policy "public_read_profile" on public.profile
for select using (true);

drop policy if exists "cms_manage_profile" on public.profile;
create policy "cms_manage_profile" on public.profile
for all using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "public_read_projects" on public.projects;
create policy "public_read_projects" on public.projects
for select using (status = 'published');

drop policy if exists "cms_manage_projects" on public.projects;
create policy "cms_manage_projects" on public.projects
for all using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "public_read_blog_posts" on public.blog_posts;
create policy "public_read_blog_posts" on public.blog_posts
for select using (status = 'published');

drop policy if exists "cms_manage_blog_posts" on public.blog_posts;
create policy "cms_manage_blog_posts" on public.blog_posts
for all using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "public_read_pages" on public.pages;
create policy "public_read_pages" on public.pages
for select using (status = 'published');

drop policy if exists "cms_manage_pages" on public.pages;
create policy "cms_manage_pages" on public.pages
for all using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "public_read_experiences" on public.experiences;
create policy "public_read_experiences" on public.experiences
for select using (true);

drop policy if exists "cms_manage_experiences" on public.experiences;
create policy "cms_manage_experiences" on public.experiences
for all using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "public_read_education" on public.education;
create policy "public_read_education" on public.education
for select using (true);

drop policy if exists "cms_manage_education" on public.education;
create policy "cms_manage_education" on public.education
for all using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "public_read_certifications" on public.certifications;
create policy "public_read_certifications" on public.certifications
for select using (true);

drop policy if exists "cms_manage_certifications" on public.certifications;
create policy "cms_manage_certifications" on public.certifications
for all using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "public_read_stack" on public.stack;
create policy "public_read_stack" on public.stack
for select using (true);

drop policy if exists "cms_manage_stack" on public.stack;
create policy "cms_manage_stack" on public.stack
for all using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "public_read_awards" on public.awards;
create policy "public_read_awards" on public.awards
for select using (true);

drop policy if exists "cms_manage_awards" on public.awards;
create policy "cms_manage_awards" on public.awards
for all using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "public_read_recommendations" on public.recommendations;
create policy "public_read_recommendations" on public.recommendations
for select using (true);

drop policy if exists "cms_manage_recommendations" on public.recommendations;
create policy "cms_manage_recommendations" on public.recommendations
for all using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "public_read_public_media" on public.media;
create policy "public_read_public_media" on public.media
for select using (visibility = 'public');

drop policy if exists "cms_manage_media" on public.media;
create policy "cms_manage_media" on public.media
for all using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "cms_manage_content_versions" on public.content_versions;
create policy "cms_manage_content_versions" on public.content_versions
for all using (public.is_cms_user()) with check (public.is_cms_user());

insert into storage.buckets (id, name, public)
values
  ('portfolio-public', 'portfolio-public', true),
  ('portfolio-private', 'portfolio-private', false)
on conflict (id) do nothing;

drop policy if exists "public_read_portfolio_public_bucket" on storage.objects;
create policy "public_read_portfolio_public_bucket" on storage.objects
for select to public
using (bucket_id = 'portfolio-public');

drop policy if exists "cms_read_storage_objects" on storage.objects;
create policy "cms_read_storage_objects" on storage.objects
for select to authenticated
using (bucket_id in ('portfolio-public', 'portfolio-private'));

drop policy if exists "cms_insert_storage_objects" on storage.objects;
create policy "cms_insert_storage_objects" on storage.objects
for insert to authenticated
with check (bucket_id in ('portfolio-public', 'portfolio-private'));

drop policy if exists "cms_update_storage_objects" on storage.objects;
create policy "cms_update_storage_objects" on storage.objects
for update to authenticated
using (bucket_id in ('portfolio-public', 'portfolio-private'))
with check (bucket_id in ('portfolio-public', 'portfolio-private'));

drop policy if exists "cms_delete_storage_objects" on storage.objects;
create policy "cms_delete_storage_objects" on storage.objects
for delete to authenticated
using (bucket_id in ('portfolio-public', 'portfolio-private'));
