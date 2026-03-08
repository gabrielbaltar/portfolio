import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";
import { PortfolioHome } from "./components/portfolio-home";
import { BlogPage } from "./components/blog-page";
import { BlogPostPage } from "./components/blog-post-page";
import { ProjectsPage } from "./components/projects-page";
import { ProjectDetailPage } from "./components/project-detail-page";
import { CMSLogin } from "./components/cms-login";
import { CMSLayout } from "./components/cms-layout";
import { CMSDashboard } from "./components/cms-dashboard";
import { CMSContentList } from "./components/cms-content-list";
import { CMSEditor } from "./components/cms-editor";
import { CMSMedia } from "./components/cms-media";
import { CMSSettings } from "./components/cms-settings";

export const router = createBrowserRouter([
  // Public portfolio
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: PortfolioHome },
      { path: "blog", Component: BlogPage },
      { path: "blog/:slug", Component: BlogPostPage },
      { path: "projects", Component: ProjectsPage },
      { path: "projects/:slug", Component: ProjectDetailPage },
    ],
  },
  // Admin (all under one RootLayout so CMSProvider is shared)
  {
    path: "/admin",
    Component: RootLayout,
    children: [
      // Login (no sidebar)
      { index: true, Component: CMSLogin },
      // Admin panel (with sidebar layout)
      {
        Component: CMSLayout,
        children: [
          { path: "dashboard", Component: CMSDashboard },
          { path: "content/:type", Component: CMSContentList },
          { path: "content/:type/:id/edit", Component: CMSEditor },
          { path: "media", Component: CMSMedia },
          { path: "settings", Component: CMSSettings },
        ],
      },
    ],
  },
  // Catch-all
  {
    path: "*",
    Component: RootLayout,
    children: [
      { path: "*", Component: PortfolioHome },
    ],
  },
]);