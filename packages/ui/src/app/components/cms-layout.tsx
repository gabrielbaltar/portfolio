import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, FileText, Image, Settings, LogOut,
  ChevronLeft, ChevronRight, Briefcase, BookOpen, Globe
} from "lucide-react";
import { useCMS } from "./cms-data";
import { dataProvider } from "./data-provider";

const NAV_SECTIONS = [
  {
    label: "Principal",
    items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    ],
  },
  {
    label: "Conteudo",
    items: [
      { key: "projects", label: "Projetos", icon: Briefcase, path: "/content/projects" },
      { key: "articles", label: "Artigos", icon: BookOpen, path: "/content/articles" },
      { key: "pages", label: "Paginas", icon: FileText, path: "/content/pages" },
    ],
  },
  {
    label: "Recursos",
    items: [
      { key: "media", label: "Midia", icon: Image, path: "/media" },
      { key: "profile", label: "Perfil & Site", icon: Settings, path: "/settings" },
    ],
  },
];

export function CMSLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useCMS();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const draftCounts = {
    projects: data.projects.filter((project) => project.status === "draft").length,
    articles: data.blogPosts.filter((post) => post.status === "draft").length,
    pages: data.pages?.filter((page) => page.status === "draft").length || 0,
  } as const;

  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:4173";

  const handleSignOut = async () => {
    try {
      await dataProvider.signOut();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex h-screen min-h-0 overflow-hidden font-['Inter',sans-serif]" style={{ backgroundColor: "#0a0a0a" }}>
      <aside
        className="flex h-full shrink-0 flex-col border-r transition-[width] duration-300"
        style={{
          width: collapsed ? "64px" : "240px",
          backgroundColor: "#111111",
          borderColor: "#1e1e1e",
        }}
      >
        <div
          className="flex h-14 items-center justify-between border-b shrink-0"
          style={{ borderColor: "#1e1e1e" }}
        >
          {!collapsed ? (
            <span className="truncate pl-4 text-[#fafafa]" style={{ fontSize: "14px", lineHeight: "21px" }}>
              CMS Admin
            </span>
          ) : (
            <span />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`cursor-pointer text-[#555] transition-colors hover:text-[#aaa] ${collapsed ? "pl-4" : "pr-4"}`}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className={collapsed ? "mb-4" : "mb-4"}>
              {!collapsed && (
                <div
                  className="px-3 mb-1 uppercase tracking-wider"
                  style={{ fontSize: "10px", lineHeight: "15px", color: "#555" }}
                >
                  {section.label}
                </div>
              )}
              {section.items.map((item) => {
                const active = isActive(item.path);
                const badgeCount = item.key in draftCounts ? draftCounts[item.key as keyof typeof draftCounts] : 0;
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={`mb-0.5 flex cursor-pointer rounded-[10px] transition-colors ${
                      active
                        ? "text-[#fafafa]"
                        : "text-[#777] hover:text-[#ccc] hover:bg-[#1a1a1a]"
                    }`}
                    style={{
                      fontSize: "13px",
                      height: collapsed ? "32px" : "35.5px",
                      backgroundColor: active ? "#1a1a1a" : undefined,
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className={`flex items-center gap-3 ${collapsed ? "w-full pl-3" : "w-full pl-3 pr-3"}`}>
                      <item.icon size={16} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && badgeCount > 0 && (
                        <span
                          className="ml-auto rounded-full px-1.5 py-0.5"
                          style={{
                            fontSize: "10px",
                            lineHeight: "15px",
                            backgroundColor: "#2a2a2a",
                            color: "#888",
                          }}
                        >
                          {badgeCount}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t px-2 py-[13px]" style={{ borderColor: "#1e1e1e" }}>
          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noreferrer"
            className="mb-0.5 flex cursor-pointer rounded-[10px] text-[#777] transition-colors hover:bg-[#1a1a1a] hover:text-[#ccc]"
            style={{ fontSize: "13px", height: collapsed ? "32px" : "35.5px" }}
            title={collapsed ? "Ver Portfolio" : undefined}
          >
            <div className={`flex items-center gap-3 ${collapsed ? "w-full pl-3" : "w-full pl-3"}`}>
              <Globe size={16} className="shrink-0" />
              {!collapsed && <span>Ver Portfolio</span>}
            </div>
          </a>
          <button
            onClick={handleSignOut}
            className="flex w-full cursor-pointer rounded-[10px] text-[#777] transition-colors hover:bg-[#1a1a1a] hover:text-[#ccc]"
            style={{ fontSize: "13px", height: collapsed ? "32px" : "35.5px" }}
            title={collapsed ? "Sair" : undefined}
          >
            <div className={`flex items-center gap-3 ${collapsed ? "w-full pl-3" : "w-full pl-3"}`}>
              <LogOut size={16} className="shrink-0" />
              {!collapsed && <span>Sair</span>}
            </div>
          </button>
        </div>
      </aside>

      <main className="min-w-0 min-h-0 flex-1 overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="h-full overflow-x-hidden overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
