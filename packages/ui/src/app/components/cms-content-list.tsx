import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Clock,
  Copy,
  EyeOff,
  FileText,
  GripVertical,
  Grid3X3,
  Image as ImageIcon,
  List,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { ensureUniqueSlug, getPublicContentVisibilityKey, legacySeedData, slugify } from "@portfolio/core";
import { toast } from "sonner";
import { useCMS, type BlogPost, type ContentStatus, type Page, type Project } from "./cms-data";
import { CMSConfirmDialog } from "./cms-confirm-dialog";

type ContentType = "projects" | "articles" | "pages";

type ContentItem = Project | BlogPost | Page;
type ContentRowDragItem = { index: number; type: string };

const CONTENT_ROW_DND_TYPE = "CMS_CONTENT_ROW";

const DEMO_SIGNATURES: Record<ContentType, { ids: Set<string>; slugs: Set<string> }> = {
  projects: {
    ids: new Set(legacySeedData.projects.map((item) => item.id)),
    slugs: new Set(legacySeedData.projects.map((item) => item.slug)),
  },
  articles: {
    ids: new Set(legacySeedData.blogPosts.map((item) => item.id)),
    slugs: new Set(legacySeedData.blogPosts.map((item) => item.slug)),
  },
  pages: {
    ids: new Set(legacySeedData.pages.map((item) => item.id)),
    slugs: new Set(legacySeedData.pages.map((item) => item.slug)),
  },
};

function isDemoItem(contentType: ContentType, item: ContentItem) {
  const signature = DEMO_SIGNATURES[contentType];
  return signature.ids.has(item.id) || signature.slugs.has(item.slug);
}

function StatusBadge({ status }: { status: ContentStatus }) {
  const config: Record<ContentStatus, { bg: string; text: string; label: string }> = {
    published: { bg: "#00ff3c14", text: "#00ff3c", label: "Publicado" },
    draft: { bg: "#ffa50014", text: "#ffa500", label: "Rascunho" },
    review: { bg: "#3b82f614", text: "#3b82f6", label: "Em revisao" },
    archived: { bg: "#55555514", text: "#888", label: "Arquivado" },
  };
  const badge = config[status];

  return (
    <span
      className="inline-flex h-[20.5px] shrink-0 items-center gap-1.5 rounded-full px-2"
      style={{ backgroundColor: badge.bg, color: badge.text, fontSize: "11px", lineHeight: "16.5px" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: badge.text }} />
      {badge.label}
    </span>
  );
}

function StatusFilter({
  active,
  onChange,
}: {
  active: ContentStatus | "all";
  onChange: (status: ContentStatus | "all") => void;
}) {
  const statuses: { key: ContentStatus | "all"; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "published", label: "Publicados" },
    { key: "draft", label: "Rascunhos" },
    { key: "review", label: "Em revisao" },
    { key: "archived", label: "Arquivados" },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {statuses.map((status) => (
        <button
          key={status.key}
          onClick={() => onChange(status.key)}
          className="flex h-[30px] items-center rounded-[10px] px-3 transition-colors"
          style={{
            backgroundColor: active === status.key ? "#1e1e1e" : "transparent",
            color: active === status.key ? "#fafafa" : "#666",
            fontSize: "12px",
            lineHeight: "18px",
          }}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
}

function ActionMenu({
  isOpen,
  onToggle,
  editLink,
  onDuplicate,
  onDelete,
}: {
  isOpen: boolean;
  onToggle: () => void;
  editLink: string;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors hover:bg-[#ffffff10]"
        style={{ color: "#ababab" }}
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} />
          <div
            className="fixed z-50 min-w-[140px] rounded-[10px] border py-1"
            style={{
              top: position.top,
              right: position.right,
              backgroundColor: "#242424",
              borderColor: "#363636",
            }}
          >
            <Link
              to={editLink}
              className="flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-[#ffffff08]"
              style={{ fontSize: "12px", lineHeight: "18px", color: "#fafafa" }}
            >
              <ArrowUpRight size={13} />
              Editar
            </Link>
            <button
              onClick={onDuplicate}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-[#ffffff08]"
              style={{ fontSize: "12px", lineHeight: "18px", color: "#fafafa" }}
            >
              <Copy size={13} />
              Duplicar
            </button>
            <button
              onClick={onDelete}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-[#ffffff08]"
              style={{ fontSize: "12px", lineHeight: "18px", color: "#ef4444" }}
            >
              <Trash2 size={13} />
              Remover
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("pt-BR");
}

function buildDraftSlug(base: string, existingSlugs: string[], fallback: string) {
  return ensureUniqueSlug(slugify(base) || fallback, existingSlugs, fallback);
}

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return items;

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function applyIdOrder<T extends { id: string }>(items: T[], ids: string[] | null) {
  if (!ids?.length) return items;

  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((item): item is T => Boolean(item));

  if (ordered.length === items.length) return ordered;

  return [...ordered, ...items.filter((item) => !ids.includes(item.id))];
}

function hasSameOrder(items: Array<{ id: string }>, ids: string[]) {
  return items.length === ids.length && items.every((item, index) => item.id === ids[index]);
}

function DraggableContentRow({
  item,
  index,
  isLast,
  contentType,
  category,
  date,
  isFeatured,
  isProtected,
  isVisible,
  fullIndex,
  canReorder,
  onMovePreview,
  onCommit,
  onCancel,
  onDuplicate,
  menuOpen,
  setMenuOpen,
  setPendingDelete,
}: {
  item: ContentItem;
  index: number;
  isLast: boolean;
  contentType: ContentType;
  category: string;
  date: string | null;
  isFeatured: boolean;
  isProtected: boolean;
  isVisible: boolean;
  fullIndex: number;
  canReorder: boolean;
  onMovePreview: (dragIndex: number, hoverIndex: number) => void;
  onCommit: () => void;
  onCancel: () => void;
  onDuplicate: (item: ContentItem) => void;
  menuOpen: string | null;
  setMenuOpen: (value: string | null) => void;
  setPendingDelete: (item: ContentItem | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: CONTENT_ROW_DND_TYPE,
    canDrag: canReorder,
    item: (): ContentRowDragItem => ({ index, type: CONTENT_ROW_DND_TYPE }),
    end: (_item, monitor) => {
      if (!canReorder) return;
      if (monitor.didDrop()) {
        onCommit();
        return;
      }
      onCancel();
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop<ContentRowDragItem, { moved: true } | void, { isOver: boolean; canDrop: boolean }>({
    accept: CONTENT_ROW_DND_TYPE,
    hover(dragItem, monitor) {
      if (!canReorder || !ref.current) return;
      const dragIndex = dragItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMovePreview(dragIndex, hoverIndex);
      dragItem.index = hoverIndex;
    },
    drop() {
      if (!canReorder) return;
      return { moved: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(handleRef);
  drop(ref);

  return (
    <div
      ref={ref}
      className={`flex items-center gap-4 px-4 transition-all hover:bg-[#2a2a2a] ${
        isDragging
          ? "opacity-45"
          : isOver && canDrop
            ? "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
            : ""
      }`}
      style={{
        height: isLast ? "63.5px" : "64.5px",
        borderBottom: isLast ? undefined : "1px solid #363636",
      }}
    >
      {fullIndex >= 0 && (
        <div className="flex shrink-0 items-center gap-2">
          <span
            ref={handleRef}
            onClick={(event) => event.stopPropagation()}
            className={`inline-flex items-center justify-center rounded-md p-1 transition-colors ${
              canReorder
                ? "cursor-grab text-[#555] hover:text-[#aaa] active:cursor-grabbing"
                : "cursor-not-allowed text-[#333]"
            }`}
            title={canReorder ? "Arrastar para reordenar" : "Limpe a busca e deixe o filtro em Todos para reordenar"}
          >
            <GripVertical size={14} />
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[#888]"
            style={{ backgroundColor: "#1a1a1a", fontSize: "11px", lineHeight: "16.5px" }}
          >
            #{fullIndex + 1}
          </span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            to={`/content/${contentType}/${item.id}/edit`}
            className="truncate text-[#fafafa]"
            style={{ fontSize: "14px", lineHeight: "21px" }}
          >
            {item.title || "Sem titulo"}
          </Link>
          {isFeatured && <Star size={12} className="fill-[#fbbf24] text-[#fbbf24]" />}
          {isProtected && <Lock size={11} className="text-[#ffa500]" />}
          {!isVisible && <EyeOff size={11} className="text-[#888]" />}
        </div>

        <div className="mt-0.5 flex items-center gap-3">
          {category ? (
            <span style={{ fontSize: "12px", lineHeight: "18px", color: "#ababab" }}>{category}</span>
          ) : null}
          {date ? (
            <span
              className="flex items-center gap-1"
              style={{ fontSize: "11px", lineHeight: "16.5px", color: "#ababab", opacity: 0.6 }}
            >
              <Clock size={10} />
              {date}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={item.status} />
        <ActionMenu
          isOpen={menuOpen === item.id}
          onToggle={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
          editLink={`/content/${contentType}/${item.id}/edit`}
          onDuplicate={() => {
            setMenuOpen(null);
            onDuplicate(item);
          }}
          onDelete={() => {
            setPendingDelete(item);
            setMenuOpen(null);
          }}
        />
      </div>
    </div>
  );
}

export function CMSContentList() {
  const { type } = useParams<{ type: ContentType }>();
  const contentType = (type || "projects") as ContentType;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, updateBlogPosts, updatePages, updateProjects, updateSiteSettings } = useCMS();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContentItem | null>(null);
  const [pendingDemoCleanup, setPendingDemoCleanup] = useState(false);
  const [dragOrderIds, setDragOrderIds] = useState<string[] | null>(null);

  const config: Record<
    ContentType,
    {
      label: string;
      icon: LucideIcon;
      color: string;
      iconBg: string;
      addLabel: string;
      emptyIcon: LucideIcon;
      emptyButton: string;
    }
  > = {
    projects: {
      label: "Projetos",
      icon: Briefcase,
      color: "#3b82f6",
      iconBg: "rgba(59,130,246,0.13)",
      addLabel: "Novo Projeto",
      emptyIcon: Briefcase,
      emptyButton: "Criar primeiro",
    },
    articles: {
      label: "Artigos",
      icon: BookOpen,
      color: "#8b5cf6",
      iconBg: "rgba(139,92,246,0.13)",
      addLabel: "Novo Artigo",
      emptyIcon: BookOpen,
      emptyButton: "Criar primeiro",
    },
    pages: {
      label: "Paginas",
      icon: FileText,
      color: "#10b981",
      iconBg: "rgba(16,185,129,0.13)",
      addLabel: "Novo Pagina",
      emptyIcon: FileText,
      emptyButton: "Criar primeiro",
    },
  };

  const currentConfig = config[contentType];
  const visibilityCollection = contentType === "projects" ? "projects" : contentType === "articles" ? "blogPosts" : "pages";
  const sourceItemsForType = contentType === "projects" ? data.projects : contentType === "articles" ? data.blogPosts : data.pages || [];
  const allItemsForType = useMemo(
    () => applyIdOrder(sourceItemsForType, dragOrderIds),
    [dragOrderIds, sourceItemsForType],
  );
  const demoItems = useMemo(
    () => allItemsForType.filter((item) => isDemoItem(contentType, item)),
    [allItemsForType, contentType],
  );
  const isReorderableContent = contentType === "projects" || contentType === "articles";
  const isReorderBlocked = statusFilter !== "all" || Boolean(search.trim());

  const items = useMemo(() => {
    let list: ContentItem[] = allItemsForType;

    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter((item) => {
        const fields = [
          item.title,
          "description" in item ? item.description : "",
          "category" in item ? item.category : "",
        ];
        return fields.some((field) => field?.toLowerCase().includes(query));
      });
    }

    return list;
  }, [allItemsForType, search, statusFilter]);

  const persistProjectOrder = (projects: Project[]) => {
    updateProjects(projects);
    updateSiteSettings({
      ...data.siteSettings,
      projectOrder: projects.map((project) => project.id),
    });
  };

  const persistBlogPostOrder = (posts: BlogPost[]) => {
    updateBlogPosts(posts);
    updateSiteSettings({
      ...data.siteSettings,
      blogPostOrder: posts.map((post) => post.id),
    });
  };

  const moveDragPreview = (dragIndex: number, hoverIndex: number) => {
    if (!isReorderableContent || isReorderBlocked) return;
    setDragOrderIds((current) => moveArrayItem(current ?? allItemsForType.map((item) => item.id), dragIndex, hoverIndex));
  };

  const cancelDragOrder = () => {
    setDragOrderIds(null);
  };

  const commitDragOrder = () => {
    if (!isReorderableContent || !dragOrderIds?.length) return;

    if (contentType === "projects") {
      const nextItems = applyIdOrder(data.projects, dragOrderIds);
      setDragOrderIds(null);
      if (!hasSameOrder(data.projects, dragOrderIds)) {
        persistProjectOrder(nextItems);
      }
      return;
    }

    const nextItems = applyIdOrder(data.blogPosts, dragOrderIds);
    setDragOrderIds(null);
    if (!hasSameOrder(data.blogPosts, dragOrderIds)) {
      persistBlogPostOrder(nextItems);
    }
  };

  useEffect(() => {
    setDragOrderIds(null);
  }, [contentType, data.projects, data.blogPosts]);

  const handleDuplicate = (item: ContentItem) => {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const cloned = {
      ...item,
      id,
      title: `${item.title} (copia)`,
      slug: `${item.slug || ""}-copy`,
      status: "draft" as ContentStatus,
      createdAt: now,
      updatedAt: now,
    };

    if (contentType === "projects") persistProjectOrder([...data.projects, cloned as Project]);
    if (contentType === "articles") persistBlogPostOrder([...data.blogPosts, cloned as BlogPost]);
    if (contentType === "pages") updatePages([...(data.pages || []), cloned as Page]);

    toast.success("Conteudo duplicado.");
  };

  const handleNew = () => {
    const id = Date.now().toString();
    const now = new Date().toISOString();

    if (contentType === "projects") {
      const slug = buildDraftSlug(`projeto-${id}`, data.projects.map((project) => project.slug).filter(Boolean), "projeto");
      const nextProject: Project = {
        id,
        title: "",
        subtitle: "",
        category: "",
        services: "",
        client: "",
        year: new Date().getFullYear().toString(),
        cardImage: "",
        cardImagePosition: "50% 50%",
        image: "",
        imagePosition: "50% 50%",
        galleryImages: [],
        galleryPositions: [],
        link: "#",
        slug,
        description: "",
        contentBlocks: [],
        status: "draft",
        tags: [],
        featured: false,
        seoTitle: "",
        seoDescription: "",
        createdAt: now,
        updatedAt: now,
        imageBgColor: "",
      };
      persistProjectOrder([...data.projects, nextProject]);
      navigate(`/content/projects/${id}/edit`);
      return;
    }

    if (contentType === "articles") {
      const slug = buildDraftSlug(`artigo-${id}`, data.blogPosts.map((post) => post.slug).filter(Boolean), "artigo");
      const nextPost: BlogPost = {
        id,
        title: "",
        subtitle: "",
        publisher: "",
        date: new Date().toLocaleDateString("pt-BR"),
        description: "",
        cardTitle: "",
        cardSubtitle: "",
        cardImage: "",
        cardImagePosition: "50% 50%",
        image: "",
        imagePosition: "50% 50%",
        galleryImages: [],
        galleryPositions: [],
        content: "",
        contentBlocks: [],
        slug,
        status: "draft",
        tags: [],
        featured: false,
        author: "Gabriel Baltar",
        readTime: "5 min",
        seoTitle: "",
        seoDescription: "",
        createdAt: now,
        updatedAt: now,
      };
      persistBlogPostOrder([...data.blogPosts, nextPost]);
      navigate(`/content/articles/${id}/edit`);
      return;
    }

    const slug = buildDraftSlug(`pagina-${id}`, (data.pages || []).map((page) => page.slug).filter(Boolean), "pagina");
    const nextPage: Page = {
      id,
      title: "",
      slug,
      description: "",
      contentBlocks: [],
      status: "draft",
      seoTitle: "",
      seoDescription: "",
      createdAt: now,
      updatedAt: now,
    };
    updatePages([...(data.pages || []), nextPage]);
    navigate(`/content/pages/${id}/edit`);
  };

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      handleNew();
    }
  }, []);

  const handleDelete = (item: ContentItem) => {
    if (contentType === "projects") persistProjectOrder(data.projects.filter((project) => project.id !== item.id));
    if (contentType === "articles") persistBlogPostOrder(data.blogPosts.filter((post) => post.id !== item.id));
    if (contentType === "pages") updatePages((data.pages || []).filter((page) => page.id !== item.id));

    toast.success("Conteudo removido.");
    setPendingDelete(null);
    setMenuOpen(null);
  };

  const handleRemoveDemoItems = () => {
    if (contentType === "projects") persistProjectOrder(data.projects.filter((project) => !isDemoItem("projects", project)));
    if (contentType === "articles") persistBlogPostOrder(data.blogPosts.filter((post) => !isDemoItem("articles", post)));
    if (contentType === "pages") updatePages((data.pages || []).filter((page) => !isDemoItem("pages", page)));

    toast.success("Conteudo demo removido.");
    setPendingDemoCleanup(false);
  };

  const Icon = currentConfig.icon;
  const EmptyIcon = currentConfig.emptyIcon;

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[10px]"
            style={{ backgroundColor: currentConfig.iconBg }}
          >
            <Icon size={20} style={{ color: currentConfig.color }} />
          </div>
          <div>
            <h1 className="text-[#fafafa]" style={{ fontSize: "20px", lineHeight: "30px" }}>
              {currentConfig.label}
            </h1>
            <p style={{ fontSize: "13px", lineHeight: "19.5px", color: "#ababab" }}>
              {items.length} {items.length === 1 ? "item" : "itens"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {demoItems.length > 0 && (
            <button
              onClick={() => setPendingDemoCleanup(true)}
              className="flex h-[35.5px] items-center gap-2 rounded-[10px] px-4 text-[#fca5a5]"
              style={{ backgroundColor: "#1a1111", border: "1px solid #3b1b1b", fontSize: "13px", lineHeight: "19.5px" }}
            >
              <Trash2 size={14} />
              Remover demos ({demoItems.length})
            </button>
          )}
          <button
            onClick={handleNew}
            className="flex h-[35.5px] items-center gap-2 rounded-[10px] px-4 text-white"
            style={{ backgroundColor: currentConfig.color, fontSize: "13px", lineHeight: "19.5px" }}
          >
            <Plus size={16} />
            {currentConfig.addLabel}
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <StatusFilter active={statusFilter} onChange={setStatusFilter} />

        <div className="flex min-w-[261.5px] items-center gap-2 max-[1180px]:w-full max-[1180px]:justify-end">
          <div
            className="flex h-[33.5px] min-w-0 flex-1 items-center gap-2 rounded-[10px] border px-[13px]"
            style={{ backgroundColor: "#242424", borderColor: "#363636", maxWidth: "280px" }}
          >
            <Search size={14} className="text-[#ababab]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar..."
              className="min-w-0 flex-1 bg-transparent text-[#fafafa] placeholder-[#ababab] outline-none"
              style={{ fontSize: "13px", lineHeight: "19.5px" }}
            />
          </div>

          <div className="flex h-[30px] overflow-hidden rounded-[10px] border" style={{ borderColor: "#363636" }}>
            <button
              onClick={() => setViewMode("list")}
              className="flex w-7 items-center justify-center"
              style={{
                backgroundColor: viewMode === "list" ? "#242424" : "transparent",
                color: viewMode === "list" ? "#fafafa" : "#ababab",
              }}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className="flex w-7 items-center justify-center"
              style={{
                backgroundColor: viewMode === "grid" ? "#242424" : "transparent",
                color: viewMode === "grid" ? "#fafafa" : "#ababab",
              }}
            >
              <Grid3X3 size={16} />
            </button>
          </div>
        </div>
      </div>

      {isReorderableContent && (
        <div
          className="mb-4 rounded-[12px] border px-3 py-2 text-[#ababab]"
          style={{ backgroundColor: "#1b1b1b", borderColor: "#2b2b2b", fontSize: "12px", lineHeight: "18px" }}
        >
          {isReorderBlocked
            ? "Limpe a busca e deixe o filtro em \"Todos\" para reorganizar a ordem publica."
            : viewMode !== "list"
              ? "Use a visualizacao em lista para mover quem aparece primeiro e por ultimo no portfolio."
              : "Arraste os itens pela alca lateral. A ordem desta lista define exatamente a ordem publica dos projetos e artigos no portfolio."}
        </div>
      )}

      {items.length === 0 ? (
        <div
          className="flex h-[258.5px] w-full flex-col items-center justify-center gap-4 rounded-[14px] border"
          style={{ backgroundColor: "#242424", borderColor: "#363636" }}
        >
          <EmptyIcon size={40} className="text-[#555]" />
          <p style={{ fontSize: "14px", lineHeight: "21px", color: "#ababab" }}>
            Nenhum conteudo encontrado
          </p>
          <button
            onClick={handleNew}
            className="flex h-[35.5px] items-center gap-2 rounded-[10px] px-4 text-white"
            style={{ backgroundColor: currentConfig.color, fontSize: "13px", lineHeight: "19.5px" }}
          >
            <Plus size={16} />
            {currentConfig.emptyButton}
          </button>
        </div>
      ) : viewMode === "list" ? (
        <DndProvider backend={HTML5Backend}>
          <div
            className="w-full overflow-hidden rounded-[14px] border"
            style={{ backgroundColor: "#242424", borderColor: "#363636" }}
          >
            {items.map((item, index) => {
              const date = formatDate(item.updatedAt);
              const category = ("category" in item ? item.category : "") ?? "";
              const isFeatured = "featured" in item && item.featured;
              const isProtected = "password" in item && Boolean(item.password);
              const isVisible = data.siteSettings.contentVisibility?.[getPublicContentVisibilityKey(visibilityCollection, item.id)] !== false;
              const fullIndex = isReorderableContent ? allItemsForType.findIndex((entry) => entry.id === item.id) : -1;

              return (
                <DraggableContentRow
                  key={item.id}
                  item={item}
                  index={index}
                  isLast={index === items.length - 1}
                  contentType={contentType}
                  category={category}
                  date={date}
                  isFeatured={isFeatured}
                  isProtected={isProtected}
                  isVisible={isVisible}
                  fullIndex={fullIndex}
                  canReorder={isReorderableContent && !isReorderBlocked}
                  onMovePreview={moveDragPreview}
                  onCommit={commitDragOrder}
                  onCancel={cancelDragOrder}
                  onDuplicate={handleDuplicate}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                  setPendingDelete={setPendingDelete}
                />
              );
            })}
          </div>
        </DndProvider>
      ) : (
        <div className="grid gap-4 min-[1180px]:grid-cols-2 min-[1440px]:grid-cols-3 min-[1800px]:grid-cols-4">
          {items.map((item) => {
            const isFeatured = "featured" in item && item.featured;
            const isProtected = "password" in item && Boolean(item.password);
            const isVisible = data.siteSettings.contentVisibility?.[getPublicContentVisibilityKey(visibilityCollection, item.id)] !== false;
            const date = formatDate(item.updatedAt);
            const category = ("category" in item ? item.category : "") ?? "";

            return (
              <Link
                key={item.id}
                to={`/content/${contentType}/${item.id}/edit`}
                className="flex min-h-[365px] flex-col overflow-hidden rounded-[14px] border"
                style={{ backgroundColor: "#242424", borderColor: "#363636" }}
              >
                {"image" in item && (((item as Project | BlogPost).cardImage || item.image)) ? (
                  <div
                    className="h-40 w-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${(item as Project | BlogPost).cardImage || item.image})`,
                      backgroundColor: "#141414",
                      backgroundPosition: (item as Project | BlogPost).cardImagePosition || item.imagePosition || "50% 50%",
                    }}
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-[#141414]">
                    <ImageIcon size={28} className="text-[#555]" />
                  </div>
                )}

                <div className="flex grow flex-col gap-2 px-4 pb-4 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-[#fafafa]" style={{ fontSize: "14px", lineHeight: "21px" }}>
                      {item.title || "Sem titulo"}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {isFeatured && <Star size={12} className="fill-[#fbbf24] text-[#fbbf24]" />}
                      {isProtected && <Lock size={11} className="text-[#ffa500]" />}
                      {!isVisible && <EyeOff size={11} className="text-[#888]" />}
                    </div>
                  </div>

                  {category ? (
                    <p style={{ fontSize: "12px", lineHeight: "18px", color: "#ababab" }}>{category}</p>
                  ) : null}

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <StatusBadge status={item.status} />
                    {date ? (
                      <span
                        className="flex items-center gap-1 whitespace-nowrap"
                        style={{ fontSize: "11px", lineHeight: "16.5px", color: "#ababab", opacity: 0.6 }}
                      >
                        <Clock size={10} />
                        {date}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <CMSConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={`Excluir ${contentType === "projects" ? "projeto" : contentType === "articles" ? "artigo" : "pagina"}?`}
        description={
          pendingDelete?.title
            ? `Esta acao remove permanentemente "${pendingDelete.title}" do CMS.`
            : "Esta acao remove permanentemente este conteudo do CMS."
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (pendingDelete) handleDelete(pendingDelete);
        }}
      />
      <CMSConfirmDialog
        open={pendingDemoCleanup}
        onOpenChange={setPendingDemoCleanup}
        title="Remover conteudo demo?"
        description={`Esta acao remove ${demoItems.length} item(ns) de exemplo desta area do CMS.`}
        confirmLabel="Remover demos"
        cancelLabel="Cancelar"
        onConfirm={handleRemoveDemoItems}
      />
    </div>
  );
}
