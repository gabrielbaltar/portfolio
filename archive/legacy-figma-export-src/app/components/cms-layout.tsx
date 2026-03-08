import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, FolderOpen, FileText, Image, Settings, LogOut,
  ChevronLeft, ChevronRight, Briefcase, BookOpen, Globe, Menu, X
} from "lucide-react";
import { useCMS } from "./cms-data";

const NAV_SECTIONS = [
  {
    label: "Principal",
    items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    ],
  },
  {
    label: "Conteudo",
    items: [
      { key: "projects", label: "Projetos", icon: Briefcase, path: "/admin/content/projects" },
      { key: "articles", label: "Artigos", icon: BookOpen, path: "/admin/content/articles" },
      { key: "pages", label: "Paginas", icon: FileText, path: "/admin/content/pages" },
    ],
  },
  {
    label: "Recursos",
    items: [
      { key: "media", label: "Midia", icon: Image, path: "/admin/media" },
      { key: "profile", label: "Perfil & Site", icon: Settings, path: "/admin/settings" },
    ],
  },
];

export function CMSLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useCMS();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const draftCount = data.projects.filter(p => p.status === "draft").length +
    data.blogPosts.filter(b => b.status === "draft").length +
    (data.pages?.filter(p => p.status === "draft").length || 0);

  return (
    <div className="flex min-h-screen font-['Inter',sans-serif]" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col border-r transition-all duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          width: collapsed ? "64px" : "240px",
          backgroundColor: "#111111",
          borderColor: "#1e1e1e",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-4 h-14 border-b shrink-0"
          style={{ borderColor: "#1e1e1e" }}
        >
          {!collapsed && (
            <span className="text-[#fafafa] truncate" style={{ fontSize: "14px" }}>
              CMS Admin
            </span>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="text-[#555] hover:text-[#aaa] cursor-pointer hidden lg:block"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-[#555] hover:text-[#aaa] cursor-pointer lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              {!collapsed && (
                <div
                  className="px-3 mb-1 uppercase tracking-wider"
                  style={{ fontSize: "10px", color: "#555" }}
                >
                  {section.label}
                </div>
              )}
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 transition-colors ${
                      active
                        ? "text-[#fafafa]"
                        : "text-[#777] hover:text-[#ccc] hover:bg-[#1a1a1a]"
                    }`}
                    style={{
                      fontSize: "13px",
                      backgroundColor: active ? "#1a1a1a" : undefined,
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={16} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.key === "projects" && draftCount > 0 && (
                      <span
                        className="ml-auto rounded-full px-1.5 py-0.5"
                        style={{
                          fontSize: "10px",
                          backgroundColor: "#2a2a2a",
                          color: "#888",
                        }}
                      >
                        {draftCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t px-2 py-3 shrink-0" style={{ borderColor: "#1e1e1e" }}>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#777] hover:text-[#ccc] hover:bg-[#1a1a1a] transition-colors"
            style={{ fontSize: "13px" }}
            title={collapsed ? "Ver Portfolio" : undefined}
          >
            <Globe size={16} className="shrink-0" />
            {!collapsed && <span>Ver Portfolio</span>}
          </Link>
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#777] hover:text-[#ccc] hover:bg-[#1a1a1a] transition-colors cursor-pointer w-full"
            style={{ fontSize: "13px" }}
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div
          className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-14 border-b"
          style={{ backgroundColor: "#111111", borderColor: "#1e1e1e" }}
        >
          <button onClick={() => setMobileOpen(true)} className="text-[#888] hover:text-white cursor-pointer">
            <Menu size={20} />
          </button>
          <span className="text-[#fafafa]" style={{ fontSize: "14px" }}>CMS Admin</span>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
