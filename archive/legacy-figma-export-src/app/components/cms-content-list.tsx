import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router";
import {
  Plus, Search, Filter, ArrowUpRight, Trash2, Copy, MoreHorizontal,
  Briefcase, BookOpen, FileText, Star, Clock, Eye, Grid3X3, List, Lock, Image as ImageIcon
} from "lucide-react";
import { useCMS, type ContentStatus, type Project, type BlogPost, type Page } from "./cms-data";
import { toast } from "sonner";

type ContentType = "projects" | "articles" | "pages";

function StatusBadge({ status }: { status: ContentStatus }) {
  const config: Record<ContentStatus, { bg: string; text: string; label: string }> = {
    published: { bg: "#00ff3c15", text: "#00ff3c", label: "Publicado" },
    draft: { bg: "#ffa50015", text: "#ffa500", label: "Rascunho" },
    review: { bg: "#3b82f615", text: "#3b82f6", label: "Em revisao" },
    archived: { bg: "#55555515", text: "#888", label: "Arquivado" },
  };
  const c = config[status];
  return (
    <span
      className="px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0"
      style={{ fontSize: "11px", backgroundColor: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.text }} />
      {c.label}
    </span>
  );
}

function StatusFilter({ active, onChange }: {
  active: ContentStatus | "all";
  onChange: (s: ContentStatus | "all") => void;
}) {
  const statuses: { key: ContentStatus | "all"; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "published", label: "Publicados" },
    { key: "draft", label: "Rascunhos" },
    { key: "review", label: "Em revisao" },
    { key: "archived", label: "Arquivados" },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-none">
      {statuses.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            active === s.key
              ? "text-[#fafafa]"
              : "text-[#666] hover:text-[#aaa] hover:bg-[#1a1a1a]"
          }`}
          style={{
            fontSize: "12px",
            backgroundColor: active === s.key ? "#1e1e1e" : undefined,
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function ActionMenu({ itemId, isOpen, onToggle, editLink, onDuplicate, onDelete }: {
  itemId: string;
  isOpen: boolean;
  onToggle: () => void;
  editLink: string;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={onToggle}
        className="p-1.5 rounded-md cursor-pointer border-none bg-transparent transition-colors hover:bg-[#ffffff10]"
        style={{ color: "var(--text-secondary)" }}
      >
        <MoreHorizontal size={16} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} />
          <div
            className="fixed z-50 rounded-lg py-1 shadow-xl min-w-[140px]"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              top: pos.top,
              right: pos.right,
            }}
          >
            <Link
              to={editLink}
              className="flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-[#ffffff08] w-full"
              style={{ fontSize: "12px", color: "var(--text-primary)", textDecoration: "none" }}
            >
              <ArrowUpRight size={13} /> Editar
            </Link>
            <button
              onClick={onDuplicate}
              className="flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-[#ffffff08] w-full cursor-pointer border-none bg-transparent text-left"
              style={{ fontSize: "12px", color: "var(--text-primary)" }}
            >
              <Copy size={13} /> Duplicar
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-[#ffffff08] w-full cursor-pointer border-none bg-transparent text-left"
              style={{ fontSize: "12px", color: "#ef4444" }}
            >
              <Trash2 size={13} /> Remover
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function CMSContentList() {
  const { type } = useParams<{ type: ContentType }>();
  const contentType = type as ContentType;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, updateProjects, updateBlogPosts, updatePages } = useCMS();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const config = {
    projects: { label: "Projetos", icon: Briefcase, color: "#3b82f6" },
    articles: { label: "Artigos", icon: BookOpen, color: "#8b5cf6" },
    pages: { label: "Paginas", icon: FileText, color: "#10b981" },
  };

  const currentConfig = config[contentType] || config.projects;

  // Get items based on type
  const items = useMemo(() => {
    let list: (Project | BlogPost | Page)[] = [];
    if (contentType === "projects") list = data.projects;
    else if (contentType === "articles") list = data.blogPosts;
    else if (contentType === "pages") list = data.pages || [];

    // Filter by status
    if (statusFilter !== "all") {
      list = list.filter((item) => (item as any).status === statusFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        (item as any).description?.toLowerCase().includes(q) ||
        (item as any).category?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [contentType, data, statusFilter, search]);

  const handleNew = () => {
    const id = Date.now().toString();
    const now = new Date().toISOString();

    if (contentType === "projects") {
      const newProject: Project = {
        id, title: "", subtitle: "", category: "", services: "", client: "",
        year: new Date().getFullYear().toString(), image: "", galleryImages: [],
        link: "#", slug: "", description: "", contentBlocks: [],
        status: "draft", tags: [], featured: false,
        seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
        imageBgColor: "",
      };
      updateProjects([...data.projects, newProject]);
      navigate(`/admin/content/projects/${id}/edit`);
    } else if (contentType === "articles") {
      const newPost: BlogPost = {
        id, title: "", publisher: "", date: new Date().toLocaleDateString("pt-BR"),
        description: "", image: "", content: "", contentBlocks: [], slug: "",
        status: "draft", tags: [], featured: false, author: "Gabriel Baltar",
        readTime: "5 min", seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
      };
      updateBlogPosts([...data.blogPosts, newPost]);
      navigate(`/admin/content/articles/${id}/edit`);
    } else if (contentType === "pages") {
      const newPage: Page = {
        id, title: "", slug: "", description: "", contentBlocks: [],
        status: "draft", seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
      };
      updatePages([...(data.pages || []), newPage]);
      navigate(`/admin/content/pages/${id}/edit`);
    }
  };

  const handleDuplicate = (item: any) => {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const cloned = { ...item, id, title: `${item.title} (copia)`, slug: `${item.slug || ""}-copy`, status: "draft" as ContentStatus, createdAt: now, updatedAt: now };

    if (contentType === "projects") updateProjects([...data.projects, cloned]);
    else if (contentType === "articles") updateBlogPosts([...data.blogPosts, cloned]);
    else if (contentType === "pages") updatePages([...(data.pages || []), cloned]);

    toast.success("Conteudo duplicado!");
    setMenuOpen(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja remover?")) return;
    if (contentType === "projects") updateProjects(data.projects.filter(p => p.id !== id));
    else if (contentType === "articles") updateBlogPosts(data.blogPosts.filter(b => b.id !== id));
    else if (contentType === "pages") updatePages((data.pages || []).filter(p => p.id !== id));
    toast.success("Removido!");
    setMenuOpen(null);
  };

  // Auto-create on ?new=1
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      handleNew();
    }
  }, []);

  const Icon = currentConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: currentConfig.color + "20" }}
          >
            <Icon size={20} style={{ color: currentConfig.color }} />
          </div>
          <div>
            <h1 style={{ fontSize: "20px", color: "var(--text-primary)" }}>
              {currentConfig.label}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {items.length} {items.length === 1 ? "item" : "itens"}
            </p>
          </div>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border-none transition-colors"
          style={{
            backgroundColor: currentConfig.color,
            color: "#fff",
            fontSize: "13px",
          }}
        >
          <Plus size={16} />
          Novo {contentType === "projects" ? "Projeto" : contentType === "articles" ? "Artigo" : "Pagina"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <StatusFilter active={statusFilter} onChange={setStatusFilter} />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-1 sm:flex-initial"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <Search size={14} style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none flex-1"
              style={{ fontSize: "13px", color: "var(--text-primary)" }}
            />
          </div>
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-primary)" }}>
            <button
              onClick={() => setViewMode("list")}
              className="p-1.5 cursor-pointer border-none transition-colors"
              style={{
                backgroundColor: viewMode === "list" ? "var(--bg-secondary)" : "transparent",
                color: viewMode === "list" ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className="p-1.5 cursor-pointer border-none transition-colors"
              style={{
                backgroundColor: viewMode === "grid" ? "var(--bg-secondary)" : "transparent",
                color: viewMode === "grid" ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              <Grid3X3 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
        >
          <Icon size={40} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
          <p className="mt-4" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Nenhum conteudo encontrado
          </p>
          <button
            onClick={handleNew}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border-none"
            style={{ backgroundColor: currentConfig.color, color: "#fff", fontSize: "13px" }}
          >
            <Plus size={16} />
            Criar primeiro
          </button>
        </div>
      ) : viewMode === "list" ? (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border-primary)" }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[#ffffff08] relative"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderBottom: i < items.length - 1 ? "1px solid var(--border-primary)" : undefined,
              }}
            >
              {/* Thumbnail */}
              {"image" in item && (item as any).image && (
                <div
                  className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${(item as any).image})`, backgroundColor: "#1a1a1a" }}
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/content/${contentType}/${item.id}/edit`}
                    className="truncate hover:underline"
                    style={{ fontSize: "14px", color: "var(--text-primary)", textDecoration: "none" }}
                  >
                    {item.title || "Sem titulo"}
                  </Link>
                  {"password" in item && (item as any).password && (
                    <Lock size={11} style={{ color: "#ffa500", opacity: 0.7 }} title="Protegido por senha" />
                  )}
                  {"featured" in item && (item as any).featured && (
                    <Star size={12} style={{ color: "#fbbf24" }} fill="#fbbf24" />
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {"category" in item && (
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {(item as any).category}
                    </span>
                  )}
                  {"updatedAt" in item && (item as any).updatedAt && (
                    <span className="flex items-center gap-1" style={{ fontSize: "11px", color: "var(--text-secondary)", opacity: 0.6 }}>
                      <Clock size={10} />
                      {new Date((item as any).updatedAt).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              {"status" in item && <StatusBadge status={(item as any).status} />}

              {/* Actions */}
              <ActionMenu
                itemId={item.id}
                isOpen={menuOpen === item.id}
                onToggle={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                editLink={`/admin/content/${contentType}/${item.id}/edit`}
                onDuplicate={() => handleDuplicate(item)}
                onDelete={() => handleDelete(item.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/admin/content/${contentType}/${item.id}/edit`}
              className="block rounded-xl overflow-hidden transition-all hover:scale-[1.02] group"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                textDecoration: "none",
              }}
            >
              {(item as any).image ? (
                <div
                  className="w-full h-40 bg-cover bg-center"
                  style={{ backgroundImage: `url(${(item as any).image})`, backgroundColor: "#1a1a1a" }}
                />
              ) : (
                <div
                  className="w-full h-40 flex items-center justify-center"
                  style={{ backgroundColor: "#141414" }}
                >
                  <ImageIcon size={28} style={{ color: "var(--text-secondary)", opacity: 0.2 }} />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3
                    className="truncate"
                    style={{ fontSize: "14px", color: "var(--text-primary)" }}
                  >
                    {item.title || "Sem titulo"}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {"password" in item && (item as any).password && (
                      <Lock size={11} style={{ color: "#ffa500", opacity: 0.7 }} title="Protegido por senha" />
                    )}
                    {"featured" in item && (item as any).featured && (
                      <Star size={12} style={{ color: "#fbbf24" }} fill="#fbbf24" />
                    )}
                  </div>
                </div>
                {"category" in item && (item as any).category && (
                  <p className="truncate mb-2" style={{ fontSize: "12px", color: "var(--text-secondary)", opacity: 0.7 }}>
                    {(item as any).category}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  {"status" in item && <StatusBadge status={(item as any).status} />}
                  {"updatedAt" in item && (item as any).updatedAt && (
                    <span className="flex items-center gap-1" style={{ fontSize: "11px", color: "var(--text-secondary)", opacity: 0.6 }}>
                      <Clock size={10} />
                      {new Date((item as any).updatedAt).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}