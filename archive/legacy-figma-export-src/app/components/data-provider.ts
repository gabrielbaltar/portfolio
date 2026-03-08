/**
 * Data Provider Abstraction Layer
 * 
 * Currently uses localStorage for persistence.
 * When ready to connect Supabase, you only need to:
 * 
 * 1. Install: pnpm add @supabase/supabase-js
 * 2. Create Supabase client in supabase-client.ts
 * 3. Implement SupabaseDataProvider (class below has the interface ready)
 * 4. Switch the export at the bottom of this file
 * 
 * Database tables needed (create in Supabase Dashboard → SQL Editor):
 * 
 * ```sql
 * -- Profile / site settings
 * CREATE TABLE profile (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   data JSONB NOT NULL,
 *   updated_at TIMESTAMPTZ DEFAULT now()
 * );
 * 
 * -- Projects
 * CREATE TABLE projects (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL DEFAULT '',
 *   subtitle TEXT DEFAULT '',
 *   category TEXT DEFAULT '',
 *   services TEXT DEFAULT '',
 *   client TEXT DEFAULT '',
 *   year TEXT DEFAULT '',
 *   image TEXT DEFAULT '',
 *   gallery_images JSONB DEFAULT '[]',
 *   link TEXT DEFAULT '#',
 *   slug TEXT UNIQUE,
 *   description TEXT DEFAULT '',
 *   content_blocks JSONB DEFAULT '[]',
 *   image_bg_color TEXT DEFAULT '',
 *   password TEXT DEFAULT '',
 *   status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
 *   tags JSONB DEFAULT '[]',
 *   featured BOOLEAN DEFAULT false,
 *   seo_title TEXT DEFAULT '',
 *   seo_description TEXT DEFAULT '',
 *   created_at TIMESTAMPTZ DEFAULT now(),
 *   updated_at TIMESTAMPTZ DEFAULT now()
 * );
 * 
 * -- Blog posts
 * CREATE TABLE blog_posts (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL DEFAULT '',
 *   publisher TEXT DEFAULT '',
 *   date TEXT DEFAULT '',
 *   description TEXT DEFAULT '',
 *   image TEXT DEFAULT '',
 *   content TEXT DEFAULT '',
 *   content_blocks JSONB DEFAULT '[]',
 *   slug TEXT UNIQUE,
 *   status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
 *   tags JSONB DEFAULT '[]',
 *   featured BOOLEAN DEFAULT false,
 *   author TEXT DEFAULT '',
 *   read_time TEXT DEFAULT '5 min',
 *   seo_title TEXT DEFAULT '',
 *   seo_description TEXT DEFAULT '',
 *   created_at TIMESTAMPTZ DEFAULT now(),
 *   updated_at TIMESTAMPTZ DEFAULT now()
 * );
 * 
 * -- Pages
 * CREATE TABLE pages (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL DEFAULT '',
 *   slug TEXT UNIQUE,
 *   description TEXT DEFAULT '',
 *   content_blocks JSONB DEFAULT '[]',
 *   status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
 *   seo_title TEXT DEFAULT '',
 *   seo_description TEXT DEFAULT '',
 *   created_at TIMESTAMPTZ DEFAULT now(),
 *   updated_at TIMESTAMPTZ DEFAULT now()
 * );
 * 
 * -- Experiences
 * CREATE TABLE experiences (
 *   id TEXT PRIMARY KEY,
 *   location TEXT DEFAULT '',
 *   company TEXT DEFAULT '',
 *   period TEXT DEFAULT '',
 *   role TEXT DEFAULT '',
 *   tasks JSONB DEFAULT '[]',
 *   sort_order INTEGER DEFAULT 0
 * );
 * 
 * -- Education
 * CREATE TABLE education (
 *   id TEXT PRIMARY KEY,
 *   location TEXT DEFAULT '',
 *   period TEXT DEFAULT '',
 *   degree TEXT DEFAULT '',
 *   university TEXT DEFAULT '',
 *   description TEXT DEFAULT '',
 *   sort_order INTEGER DEFAULT 0
 * );
 * 
 * -- Certifications
 * CREATE TABLE certifications (
 *   id TEXT PRIMARY KEY,
 *   title TEXT DEFAULT '',
 *   issuer TEXT DEFAULT '',
 *   link TEXT DEFAULT '',
 *   sort_order INTEGER DEFAULT 0
 * );
 * 
 * -- Stack items
 * CREATE TABLE stack (
 *   id TEXT PRIMARY KEY,
 *   name TEXT DEFAULT '',
 *   description TEXT DEFAULT '',
 *   color TEXT DEFAULT '#555',
 *   link TEXT DEFAULT '',
 *   sort_order INTEGER DEFAULT 0
 * );
 * 
 * -- Awards
 * CREATE TABLE awards (
 *   id TEXT PRIMARY KEY,
 *   title TEXT DEFAULT '',
 *   issuer TEXT DEFAULT '',
 *   link TEXT DEFAULT '',
 *   sort_order INTEGER DEFAULT 0
 * );
 * 
 * -- Recommendations
 * CREATE TABLE recommendations (
 *   id TEXT PRIMARY KEY,
 *   name TEXT DEFAULT '',
 *   role TEXT DEFAULT '',
 *   quote TEXT DEFAULT '',
 *   sort_order INTEGER DEFAULT 0
 * );
 * 
 * -- Media library
 * CREATE TABLE media (
 *   id TEXT PRIMARY KEY,
 *   url TEXT NOT NULL,
 *   name TEXT DEFAULT '',
 *   type TEXT DEFAULT '',
 *   size INTEGER DEFAULT 0,
 *   created_at TIMESTAMPTZ DEFAULT now()
 * );
 * 
 * -- Version history
 * CREATE TABLE content_versions (
 *   id TEXT PRIMARY KEY,
 *   content_id TEXT NOT NULL,
 *   timestamp TIMESTAMPTZ DEFAULT now(),
 *   label TEXT DEFAULT '',
 *   data JSONB NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT now()
 * );
 * CREATE INDEX idx_versions_content_id ON content_versions(content_id);
 * 
 * -- RLS policies (enable RLS on all tables)
 * -- For public read (portfolio):
 * -- CREATE POLICY "Public read published" ON projects FOR SELECT USING (status = 'published');
 * -- CREATE POLICY "Public read published" ON blog_posts FOR SELECT USING (status = 'published');
 * -- For admin write:
 * -- CREATE POLICY "Admin full access" ON projects FOR ALL USING (auth.role() = 'authenticated');
 * -- (repeat for all tables)
 * 
 * -- Supabase Storage bucket for media:
 * -- Create bucket "media" in Supabase Dashboard → Storage
 * -- Set public access for the bucket
 * ```
 * 
 * Supabase Auth setup:
 * - Enable Email auth in Supabase Dashboard → Authentication → Providers
 * - Create your admin user via Dashboard → Authentication → Users → Add User
 * - Update cms-login.tsx to use supabase.auth.signInWithPassword()
 * - Update cms-layout.tsx to check supabase.auth.getSession()
 */

import type { CMSData, MediaItem } from "./cms-data";

// Storage warning event — components can listen to this
export const storageEvents = {
  listeners: [] as Array<(msg: string, type: "warning" | "error") => void>,
  emit(msg: string, type: "warning" | "error" = "warning") {
    this.listeners.forEach((fn) => fn(msg, type));
  },
  on(fn: (msg: string, type: "warning" | "error") => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  },
};

// --- Data Provider Interface ---
export interface DataProvider {
  // Load all CMS data
  loadData(): Promise<CMSData> | CMSData;
  
  // Save all CMS data
  saveData(data: CMSData): Promise<void> | void;
  
  // Media operations (for Supabase Storage)
  uploadMedia?(file: File): Promise<MediaItem>;
  deleteMedia?(id: string, url: string): Promise<void>;
  
  // Version history
  loadVersions(contentId: string): Promise<any[]> | any[];
  saveVersion(contentId: string, data: Record<string, any>, label: string): Promise<any> | any;
  
  // Auth (for Supabase Auth)
  signIn?(email: string, password: string): Promise<{ success: boolean; error?: string }>;
  signOut?(): Promise<void>;
  getSession?(): Promise<{ authenticated: boolean; user?: any }>;
  
  // Provider type identifier
  readonly type: "localStorage" | "supabase";
}

// --- localStorage Implementation (current) ---
const CMS_STORAGE_KEY = "portfolio-cms-data";
const VERSIONS_STORAGE_KEY = "portfolio-cms-versions";

export class LocalStorageProvider implements DataProvider {
  readonly type = "localStorage" as const;

  loadData(): CMSData {
    try {
      const stored = localStorage.getItem(CMS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Return null to let cms-data.tsx use defaults
    return null as any;
  }

  saveData(data: CMSData): void {
    const json = JSON.stringify(data);
    
    // Check size before attempting save
    const sizeKB = Math.round(json.length / 1024);
    const limitKB = 4.5 * 1024; // ~4.5MB safe limit (localStorage is ~5MB)
    
    if (sizeKB > limitKB * 0.85) {
      storageEvents.emit(
        `Armazenamento quase cheio (${sizeKB}KB / ${Math.round(limitKB)}KB). Considere remover imagens ou conectar o Supabase.`,
        "warning"
      );
    }

    try {
      localStorage.setItem(CMS_STORAGE_KEY, json);
    } catch (err) {
      if (err instanceof DOMException && (err.name === "QuotaExceededError" || err.code === 22)) {
        // Try to free space: clean versions first
        try {
          localStorage.removeItem(VERSIONS_STORAGE_KEY);
        } catch {}
        
        // Try to clean translation cache
        try {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("translation_") || key.startsWith("cms-translations"))) {
              localStorage.removeItem(key);
            }
          }
        } catch {}
        
        // Retry save
        try {
          localStorage.setItem(CMS_STORAGE_KEY, json);
          storageEvents.emit(
            "Espaco liberado automaticamente (cache de versoes e traducoes limpo). Dados salvos.",
            "warning"
          );
          return;
        } catch {
          // Still failing — data is too large
        }

        // Last resort: notify user, don't crash
        storageEvents.emit(
          "Armazenamento cheio! As imagens sao muito grandes para o localStorage (~5MB). Use URLs externas (Unsplash, Imgur) ou conecte o Supabase para armazenamento ilimitado.",
          "error"
        );
        console.error("[CMS] QuotaExceededError: localStorage full. Data size:", sizeKB, "KB");
      } else {
        throw err;
      }
    }
  }

  loadVersions(contentId: string): any[] {
    try {
      const stored = localStorage.getItem(VERSIONS_STORAGE_KEY);
      const all = stored ? JSON.parse(stored) : {};
      return all[contentId] || [];
    } catch {
      return [];
    }
  }

  saveVersion(contentId: string, data: Record<string, any>, label: string): any {
    try {
      const stored = localStorage.getItem(VERSIONS_STORAGE_KEY);
      const all = stored ? JSON.parse(stored) : {};
      const versions = all[contentId] || [];
      const newVersion = {
        id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        label,
        data: structuredClone(data),
      };
      all[contentId] = [newVersion, ...versions].slice(0, 30);
      localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(all));
      return newVersion;
    } catch {
      // localStorage full — try trimming
      try {
        const stored = localStorage.getItem(VERSIONS_STORAGE_KEY);
        const all = stored ? JSON.parse(stored) : {};
        for (const key of Object.keys(all)) {
          if (all[key].length > 5) all[key] = all[key].slice(0, 5);
        }
        localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(all));
      } catch {}
      return null;
    }
  }

  // Mock auth for localStorage mode
  async signIn(email: string, password: string) {
    // Accept any credentials in localStorage mode
    sessionStorage.setItem("cms-auth", "true");
    return { success: true };
  }

  async signOut() {
    sessionStorage.removeItem("cms-auth");
  }

  async getSession() {
    return {
      authenticated: sessionStorage.getItem("cms-auth") === "true",
      user: { email: "admin@portfolio.com" },
    };
  }
}

// --- Supabase Implementation (PLACEHOLDER — implement when connecting) ---
// 
// To implement:
// 1. Create /src/app/components/supabase-client.ts:
//
//    import { createClient } from '@supabase/supabase-js';
//    
//    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
//    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
//    
//    export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
//
// 2. Implement SupabaseDataProvider below
// 3. Switch the export at the bottom

/*
export class SupabaseDataProvider implements DataProvider {
  readonly type = "supabase" as const;
  private supabase: any; // SupabaseClient

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async loadData(): Promise<CMSData> {
    const [
      { data: profile },
      { data: projects },
      { data: blogPosts },
      { data: pages },
      { data: experiences },
      { data: education },
      { data: certifications },
      { data: stack },
      { data: awards },
      { data: recommendations },
      { data: media },
    ] = await Promise.all([
      this.supabase.from('profile').select('data').single(),
      this.supabase.from('projects').select('*').order('created_at', { ascending: false }),
      this.supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
      this.supabase.from('pages').select('*').order('created_at', { ascending: false }),
      this.supabase.from('experiences').select('*').order('sort_order'),
      this.supabase.from('education').select('*').order('sort_order'),
      this.supabase.from('certifications').select('*').order('sort_order'),
      this.supabase.from('stack').select('*').order('sort_order'),
      this.supabase.from('awards').select('*').order('sort_order'),
      this.supabase.from('recommendations').select('*').order('sort_order'),
      this.supabase.from('media').select('*').order('created_at', { ascending: false }),
    ]);

    return {
      profile: profile?.data || {},
      projects: (projects || []).map(this.mapProjectFromDb),
      experiences: experiences || [],
      education: education || [],
      certifications: certifications || [],
      stack: stack || [],
      awards: awards || [],
      recommendations: recommendations || [],
      blogPosts: (blogPosts || []).map(this.mapBlogPostFromDb),
      pages: (pages || []).map(this.mapPageFromDb),
      media: media || [],
    } as CMSData;
  }

  async saveData(data: CMSData): Promise<void> {
    // Upsert profile
    await this.supabase.from('profile').upsert({ id: 'main', data: data.profile });
    
    // For collections, use upsert with the full array
    // In production, you'd want more granular updates
    for (const project of data.projects) {
      await this.supabase.from('projects').upsert(this.mapProjectToDb(project));
    }
    for (const post of data.blogPosts) {
      await this.supabase.from('blog_posts').upsert(this.mapBlogPostToDb(post));
    }
    // ... similar for other collections
  }

  async uploadMedia(file: File): Promise<MediaItem> {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await this.supabase.storage
      .from('media')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = this.supabase.storage
      .from('media')
      .getPublicUrl(fileName);
    
    const mediaItem: MediaItem = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      url: publicUrl,
      name: file.name,
      type: file.type,
      size: file.size,
      createdAt: new Date().toISOString(),
    };
    
    await this.supabase.from('media').insert(mediaItem);
    return mediaItem;
  }

  async deleteMedia(id: string, url: string): Promise<void> {
    // Extract file path from URL
    const path = url.split('/media/')[1];
    if (path) {
      await this.supabase.storage.from('media').remove([path]);
    }
    await this.supabase.from('media').delete().eq('id', id);
  }

  async loadVersions(contentId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('content_versions')
      .select('*')
      .eq('content_id', contentId)
      .order('timestamp', { ascending: false })
      .limit(30);
    return data || [];
  }

  async saveVersion(contentId: string, data: Record<string, any>, label: string): Promise<any> {
    const version = {
      id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      content_id: contentId,
      timestamp: new Date().toISOString(),
      label,
      data,
    };
    await this.supabase.from('content_versions').insert(version);
    return version;
  }

  async signIn(email: string, password: string) {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return {
      authenticated: !!session,
      user: session?.user || null,
    };
  }

  // DB mapping helpers (snake_case ↔ camelCase)
  private mapProjectFromDb(row: any) {
    return {
      ...row,
      galleryImages: row.gallery_images || [],
      contentBlocks: row.content_blocks || [],
      imageBgColor: row.image_bg_color || '',
      password: row.password || '',
      seoTitle: row.seo_title || '',
      seoDescription: row.seo_description || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
  
  private mapProjectToDb(project: any) {
    return {
      id: project.id,
      title: project.title,
      subtitle: project.subtitle,
      category: project.category,
      services: project.services,
      client: project.client,
      year: project.year,
      image: project.image,
      gallery_images: project.galleryImages,
      link: project.link,
      slug: project.slug,
      description: project.description,
      content_blocks: project.contentBlocks,
      image_bg_color: project.imageBgColor,
      password: project.password,
      status: project.status,
      tags: project.tags,
      featured: project.featured,
      seo_title: project.seoTitle,
      seo_description: project.seoDescription,
      updated_at: project.updatedAt,
    };
  }

  private mapBlogPostFromDb(row: any) {
    return {
      ...row,
      contentBlocks: row.content_blocks || [],
      readTime: row.read_time || '5 min',
      seoTitle: row.seo_title || '',
      seoDescription: row.seo_description || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapBlogPostToDb(post: any) {
    return {
      id: post.id,
      title: post.title,
      publisher: post.publisher,
      date: post.date,
      description: post.description,
      image: post.image,
      content: post.content,
      content_blocks: post.contentBlocks,
      slug: post.slug,
      status: post.status,
      tags: post.tags,
      featured: post.featured,
      author: post.author,
      read_time: post.readTime,
      seo_title: post.seoTitle,
      seo_description: post.seoDescription,
      updated_at: post.updatedAt,
    };
  }

  private mapPageFromDb(row: any) {
    return {
      ...row,
      contentBlocks: row.content_blocks || [],
      seoTitle: row.seo_title || '',
      seoDescription: row.seo_description || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
*/

// --- Active Provider ---
// Switch this when connecting Supabase:
// import { supabase } from './supabase-client';
// export const dataProvider: DataProvider = new SupabaseDataProvider(supabase);

export const dataProvider: DataProvider = new LocalStorageProvider();