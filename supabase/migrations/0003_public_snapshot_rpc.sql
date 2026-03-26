create index if not exists idx_projects_public_listing
  on public.projects (status, created_at desc);

create index if not exists idx_blog_posts_public_listing
  on public.blog_posts (status, created_at desc);

create index if not exists idx_pages_public_listing
  on public.pages (status, created_at desc);

create index if not exists idx_experiences_sort_order
  on public.experiences (sort_order);

create index if not exists idx_education_sort_order
  on public.education (sort_order);

create index if not exists idx_certifications_sort_order
  on public.certifications (sort_order);

create index if not exists idx_stack_sort_order
  on public.stack (sort_order);

create index if not exists idx_awards_sort_order
  on public.awards (sort_order);

create index if not exists idx_recommendations_sort_order
  on public.recommendations (sort_order);

create or replace function public.get_public_portfolio_snapshot()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'siteSettingsRow',
    (
      select jsonb_build_object(
        'id', s.id,
        'data', s.data,
        'created_at', s.created_at,
        'updated_at', s.updated_at
      )
      from public.site_settings s
      where s.id = 'main'
      limit 1
    ),
    'profileRow',
    (
      select jsonb_build_object(
        'id', p.id,
        'data', p.data,
        'created_at', p.created_at,
        'updated_at', p.updated_at
      )
      from public.profile p
      where p.id = 'main'
      limit 1
    ),
    'projectsRows',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'subtitle', p.subtitle,
            'category', p.category,
            'services', p.services,
            'client', p.client,
            'year', p.year,
            'image', p.image,
            'image_bg_color', p.image_bg_color,
            'image_position', p.image_position,
            'gallery_images', p.gallery_images,
            'gallery_positions', p.gallery_positions,
            'link', p.link,
            'slug', p.slug,
            'description', p.description,
            'content_blocks', p.content_blocks,
            'password', p.password,
            'status', p.status,
            'tags', p.tags,
            'featured', p.featured,
            'seo_title', p.seo_title,
            'seo_description', p.seo_description,
            'published_at', p.published_at,
            'created_at', p.created_at,
            'updated_at', p.updated_at
          )
          order by p.created_at desc
        ),
        '[]'::jsonb
      )
      from public.projects p
      where p.status = 'published'
    ),
    'blogPostsRows',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'subtitle', p.subtitle,
            'publisher', p.publisher,
            'date', p.date,
            'description', p.description,
            'image', p.image,
            'image_bg_color', p.image_bg_color,
            'image_position', p.image_position,
            'gallery_images', p.gallery_images,
            'gallery_positions', p.gallery_positions,
            'content', p.content,
            'content_blocks', p.content_blocks,
            'slug', p.slug,
            'status', p.status,
            'tags', p.tags,
            'featured', p.featured,
            'author', p.author,
            'read_time', p.read_time,
            'link', p.link,
            'category', p.category,
            'services', p.services,
            'password', p.password,
            'seo_title', p.seo_title,
            'seo_description', p.seo_description,
            'published_at', p.published_at,
            'created_at', p.created_at,
            'updated_at', p.updated_at
          )
          order by p.created_at desc
        ),
        '[]'::jsonb
      )
      from public.blog_posts p
      where p.status = 'published'
    ),
    'pagesRows',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'slug', p.slug,
            'description', p.description,
            'content_blocks', p.content_blocks,
            'status', p.status,
            'seo_title', p.seo_title,
            'seo_description', p.seo_description,
            'published_at', p.published_at,
            'created_at', p.created_at,
            'updated_at', p.updated_at
          )
          order by p.created_at desc
        ),
        '[]'::jsonb
      )
      from public.pages p
      where p.status = 'published'
    ),
    'experiencesRows',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', e.id,
            'location', e.location,
            'company', e.company,
            'period', e.period,
            'role', e.role,
            'tasks', e.tasks,
            'sort_order', e.sort_order
          )
          order by e.sort_order asc
        ),
        '[]'::jsonb
      )
      from public.experiences e
    ),
    'educationRows',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', e.id,
            'location', e.location,
            'period', e.period,
            'degree', e.degree,
            'university', e.university,
            'description', e.description,
            'sort_order', e.sort_order
          )
          order by e.sort_order asc
        ),
        '[]'::jsonb
      )
      from public.education e
    ),
    'certificationsRows',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', c.id,
            'title', c.title,
            'issuer', c.issuer,
            'link', c.link,
            'sort_order', c.sort_order
          )
          order by c.sort_order asc
        ),
        '[]'::jsonb
      )
      from public.certifications c
    ),
    'stackRows',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'description', s.description,
            'color', s.color,
            'link', s.link,
            'sort_order', s.sort_order
          )
          order by s.sort_order asc
        ),
        '[]'::jsonb
      )
      from public.stack s
    ),
    'awardsRows',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'title', a.title,
            'issuer', a.issuer,
            'link', a.link,
            'sort_order', a.sort_order
          )
          order by a.sort_order asc
        ),
        '[]'::jsonb
      )
      from public.awards a
    ),
    'recommendationsRows',
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', r.id,
            'name', r.name,
            'role', r.role,
            'quote', r.quote,
            'sort_order', r.sort_order
          )
          order by r.sort_order asc
        ),
        '[]'::jsonb
      )
      from public.recommendations r
    )
  );
$$;

revoke all on function public.get_public_portfolio_snapshot() from public;
grant execute on function public.get_public_portfolio_snapshot() to anon, authenticated, service_role;

analyze public.projects;
analyze public.blog_posts;
analyze public.pages;
analyze public.experiences;
analyze public.education;
analyze public.certifications;
analyze public.stack;
analyze public.awards;
analyze public.recommendations;

notify pgrst, 'reload schema';
