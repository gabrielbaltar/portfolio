import { Link } from "react-router";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Clock,
  Eye,
  FileText,
  Image,
  type LucideIcon,
} from "lucide-react";
import { useCMS } from "./cms-data";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  note?: string;
}) {
  return (
    <div
      className="relative rounded-[14px] border px-4 pb-[18px] pt-4"
      style={{ backgroundColor: "#141414", borderColor: "#1e1e1e" }}
    >
      <div className="mb-7 flex items-start justify-between">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: `${color}14` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
        {note && (
          <span style={{ fontSize: "11px", lineHeight: "16.5px", color: "#555" }}>
            {note}
          </span>
        )}
      </div>
      <div className="text-[#fafafa]" style={{ fontSize: "24px", lineHeight: "36px" }}>
        {value}
      </div>
      <div style={{ fontSize: "12px", lineHeight: "18px", color: "#666" }}>{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; label: string }> = {
    published: { bg: "#00ff3c14", text: "#00ff3c", label: "Publicado" },
    draft: { bg: "#ffa50014", text: "#ffa500", label: "Rascunho" },
    review: { bg: "#3b82f614", text: "#3b82f6", label: "Em revisao" },
    archived: { bg: "#55555514", text: "#888", label: "Arquivado" },
  };
  const badge = colors[status] || colors.draft;

  return (
    <span
      className="inline-flex h-[20.5px] items-center gap-1.5 rounded-full px-2"
      style={{ backgroundColor: badge.bg, color: badge.text, fontSize: "11px", lineHeight: "16.5px" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: badge.text }} />
      {badge.label}
    </span>
  );
}

export function CMSDashboard() {
  const { data } = useCMS();
  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:4173";

  const publishedProjects = data.projects.filter((project) => project.status === "published").length;
  const publishedArticles = data.blogPosts.filter((post) => post.status === "published").length;
  const draftCount =
    data.projects.filter((project) => project.status === "draft").length +
    data.blogPosts.filter((post) => post.status === "draft").length;
  const totalMedia = data.media?.length || 0;

  const recentItems = [
    ...data.projects.map((project) => ({
      id: project.id,
      title: project.title,
      type: "project" as const,
      status: project.status,
      updatedAt: project.updatedAt || "",
    })),
    ...data.blogPosts.map((post) => ({
      id: post.id,
      title: post.title,
      type: "article" as const,
      status: post.status,
      updatedAt: post.updatedAt || "",
    })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  const quickActions = [
    { label: "Novo Projeto", icon: Briefcase, path: "/content/projects?new=1" },
    { label: "Novo Artigo", icon: BookOpen, path: "/content/articles?new=1" },
    { label: "Nova Pagina", icon: FileText, path: "/content/pages?new=1" },
    { label: "Upload Midia", icon: Image, path: "/media" },
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-[#fafafa]" style={{ fontSize: "22px", lineHeight: "33px" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "13px", lineHeight: "19.5px", color: "#666" }}>
          Visao geral do seu conteudo
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 min-[1400px]:grid-cols-4">
        <StatCard icon={Briefcase} label="Projetos publicados" value={publishedProjects} color="#3b82f6" />
        <StatCard icon={BookOpen} label="Artigos publicados" value={publishedArticles} color="#8b5cf6" />
        <StatCard icon={Clock} label="Rascunhos pendentes" value={draftCount} color="#f59e0b" note="a fazer" />
        <StatCard icon={Image} label="Arquivos de midia" value={totalMedia} color="#10b981" />
      </div>

      <div className="grid gap-6 min-[1320px]:grid-cols-[minmax(0,1.9fr)_minmax(320px,1fr)]">
        <div>
          <h2 className="mb-4 text-[#fafafa]" style={{ fontSize: "15px", lineHeight: "22.5px" }}>
            Conteudo recente
          </h2>
          <div
            className="overflow-hidden rounded-[14px] border"
            style={{ backgroundColor: "#141414", borderColor: "#1e1e1e" }}
          >
            {recentItems.length === 0 ? (
              <div
                className="flex items-center justify-center text-center"
                style={{ height: "365px", fontSize: "13px", lineHeight: "19.5px", color: "#555" }}
              >
                Nenhum conteudo ainda
              </div>
            ) : (
              recentItems.map((item, index) => {
                const ItemIcon = item.type === "project" ? Briefcase : BookOpen;
                const itemColor = item.type === "project" ? "#3b82f6" : "#8b5cf6";
                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={`/content/${item.type === "project" ? "projects" : "articles"}/${item.id}/edit`}
                    className="flex items-center justify-between px-4 transition-colors hover:bg-[#181818]"
                    style={{
                      height: index === recentItems.length - 1 ? "60px" : "61px",
                      borderBottom: index === recentItems.length - 1 ? undefined : "1px solid #1e1e1e",
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px]"
                        style={{ backgroundColor: "#1a1a1a" }}
                      >
                        <ItemIcon size={13} style={{ color: itemColor }} />
                      </div>
                      <div className="min-w-0">
                        <div
                          className="truncate text-[#ddd]"
                          style={{ fontSize: "13px", lineHeight: "19.5px" }}
                        >
                          {item.title || "Sem titulo"}
                        </div>
                        <div style={{ fontSize: "11px", lineHeight: "16.5px", color: "#555" }}>
                          {item.type === "project" ? "Projeto" : "Artigo"}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-[#fafafa]" style={{ fontSize: "15px", lineHeight: "22.5px" }}>
            Acoes rapidas
          </h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className="flex h-[58px] items-center gap-3 rounded-[14px] border pl-[17px] pr-4 transition-colors hover:bg-[#181818]"
                style={{ backgroundColor: "#141414", borderColor: "#1e1e1e" }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  <action.icon size={14} className="text-[#666]" />
                </div>
                <span style={{ fontSize: "13px", lineHeight: "19.5px", color: "#aaa" }}>
                  {action.label}
                </span>
              </Link>
            ))}
          </div>

          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex h-[58px] items-center rounded-[14px] border pl-4 pr-4 transition-colors hover:bg-[#181818]"
            style={{ backgroundColor: "#141414", borderColor: "#1e1e1e" }}
          >
            <div
              className="mr-3 flex h-8 w-8 items-center justify-center rounded-[10px]"
              style={{ backgroundColor: "#00ff3c14" }}
            >
              <Eye size={14} className="text-[#00ff3c]" />
            </div>
            <span style={{ fontSize: "13px", lineHeight: "19.5px", color: "#aaa" }}>
              Ver portfolio publico
            </span>
            <ArrowUpRight size={14} className="ml-auto text-[#444]" />
          </a>
        </div>
      </div>
    </div>
  );
}
