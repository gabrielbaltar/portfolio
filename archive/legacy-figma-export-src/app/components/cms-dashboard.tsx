import { useCMS } from "./cms-data";
import { Link } from "react-router";
import {
  Briefcase, BookOpen, FileText, Image, TrendingUp,
  Clock, Star, ArrowUpRight, Plus, Eye
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sublabel, color }: {
  icon: typeof Briefcase; label: string; value: number; sublabel?: string; color: string;
}) {
  return (
    <div
      className="rounded-xl p-4 transition-colors"
      style={{ backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
        {sublabel && (
          <span className="text-[#555]" style={{ fontSize: "11px" }}>{sublabel}</span>
        )}
      </div>
      <div className="text-[#fafafa] mb-0.5" style={{ fontSize: "24px" }}>{value}</div>
      <div className="text-[#666]" style={{ fontSize: "12px" }}>{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    published: { bg: "#00ff3c15", text: "#00ff3c" },
    draft: { bg: "#ffa50015", text: "#ffa500" },
    review: { bg: "#3b82f615", text: "#3b82f6" },
    archived: { bg: "#55555515", text: "#888" },
  };
  const c = colors[status] || colors.draft;
  return (
    <span
      className="px-2 py-0.5 rounded-full inline-flex items-center gap-1"
      style={{ fontSize: "11px", backgroundColor: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.text }} />
      {status === "published" ? "Publicado" : status === "draft" ? "Rascunho" : status === "review" ? "Revisao" : "Arquivado"}
    </span>
  );
}

export function CMSDashboard() {
  const { data } = useCMS();

  const publishedProjects = data.projects.filter(p => p.status === "published").length;
  const publishedArticles = data.blogPosts.filter(b => b.status === "published").length;
  const draftCount = data.projects.filter(p => p.status === "draft").length +
    data.blogPosts.filter(b => b.status === "draft").length;
  const totalMedia = data.media?.length || 0;

  // Recent content
  const recentItems = [
    ...data.projects.map(p => ({ id: p.id, title: p.title, type: "project" as const, status: p.status, updatedAt: p.updatedAt || "" })),
    ...data.blogPosts.map(b => ({ id: b.id, title: b.title, type: "article" as const, status: b.status, updatedAt: b.updatedAt || "" })),
  ].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 6);

  const quickActions = [
    { label: "Novo Projeto", icon: Briefcase, path: "/admin/content/projects?new=1" },
    { label: "Novo Artigo", icon: BookOpen, path: "/admin/content/articles?new=1" },
    { label: "Nova Pagina", icon: FileText, path: "/admin/content/pages?new=1" },
    { label: "Upload Midia", icon: Image, path: "/admin/media" },
  ];

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[#fafafa] mb-1" style={{ fontSize: "22px" }}>
          Dashboard
        </h1>
        <p className="text-[#666]" style={{ fontSize: "13px" }}>
          Visao geral do seu conteudo
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard icon={Briefcase} label="Projetos publicados" value={publishedProjects} color="#3b82f6" />
        <StatCard icon={BookOpen} label="Artigos publicados" value={publishedArticles} color="#8b5cf6" />
        <StatCard icon={Clock} label="Rascunhos pendentes" value={draftCount} sublabel="a fazer" color="#f59e0b" />
        <StatCard icon={Image} label="Arquivos de midia" value={totalMedia} color="#10b981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent content */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#fafafa]" style={{ fontSize: "15px" }}>Conteudo recente</h2>
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
          >
            {recentItems.length === 0 ? (
              <div className="p-8 text-center text-[#555]" style={{ fontSize: "13px" }}>
                Nenhum conteudo ainda
              </div>
            ) : (
              <div>
                {recentItems.map((item, i) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={`/admin/content/${item.type === "project" ? "projects" : "articles"}/${item.id}/edit`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#1a1a1a] transition-colors group"
                    style={{ borderBottom: i < recentItems.length - 1 ? "1px solid #1e1e1e" : undefined }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#1a1a1a" }}
                      >
                        {item.type === "project" ? (
                          <Briefcase size={13} className="text-[#3b82f6]" />
                        ) : (
                          <BookOpen size={13} className="text-[#8b5cf6]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[#ddd] truncate" style={{ fontSize: "13px" }}>
                          {item.title || "Sem titulo"}
                        </div>
                        <div className="text-[#555]" style={{ fontSize: "11px" }}>
                          {item.type === "project" ? "Projeto" : "Artigo"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={item.status} />
                      <ArrowUpRight size={14} className="text-[#444] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-[#fafafa] mb-4" style={{ fontSize: "15px" }}>Acoes rapidas</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-[#1a1a1a] group"
                style={{ backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  <action.icon size={14} className="text-[#888]" />
                </div>
                <span className="text-[#aaa] group-hover:text-[#ddd] transition-colors" style={{ fontSize: "13px" }}>
                  {action.label}
                </span>
                <Plus size={14} className="text-[#444] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>

          {/* Portfolio link */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl mt-4 transition-colors hover:bg-[#1a1a1a] group"
            style={{ backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#00ff3c15" }}
            >
              <Eye size={14} className="text-[#00ff3c]" />
            </div>
            <span className="text-[#aaa] group-hover:text-[#ddd] transition-colors" style={{ fontSize: "13px" }}>
              Ver portfolio publico
            </span>
            <ArrowUpRight size={14} className="text-[#444] ml-auto" />
          </Link>
        </div>
      </div>
    </div>
  );
}
