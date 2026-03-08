import { createBrowserRouter } from "react-router";
import {
  BlogPage,
  BlogPostPage,
  PageView,
  PortfolioHome,
  ProjectDetailPage,
  ProjectsPage,
  PublicRootLayout,
} from "@portfolio/ui";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicRootLayout,
    children: [
      { index: true, Component: PortfolioHome },
      { path: "blog", Component: BlogPage },
      { path: "blog/:slug", Component: BlogPostPage },
      { path: "projects", Component: ProjectsPage },
      { path: "projects/:slug", Component: ProjectDetailPage },
      { path: ":slug", Component: PageView },
    ],
  },
]);
