import { createBrowserRouter, Navigate, Outlet } from "react-router";
import {
  CMSAuthProvider,
  CMSAccessRequests,
  CMSContentList,
  CMSDashboard,
  CMSDataLayout,
  CMSEditor,
  CMSLayout,
  CMSLogin,
  CMSMedia,
  CMSSettings,
  RedirectIfAuthenticated,
  RequireCMSAuth,
  PostHogRouteTracker,
} from "@portfolio/ui";

function CMSAuthLayout() {
  return (
    <CMSAuthProvider>
      <PostHogRouteTracker appName="portfolio-cms" />
      <Outlet />
    </CMSAuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: CMSAuthLayout,
    children: [
      {
        Component: RedirectIfAuthenticated,
        children: [
          { index: true, element: <Navigate to="/login" replace /> },
          { path: "login", Component: CMSLogin },
        ],
      },
      {
        Component: RequireCMSAuth,
        children: [
          {
            Component: CMSDataLayout,
            children: [
              {
                Component: CMSLayout,
                children: [
                  { index: true, element: <Navigate to="/dashboard" replace /> },
                  { path: "dashboard", Component: CMSDashboard },
                  { path: "access-requests", Component: CMSAccessRequests },
                  { path: "content/:type", Component: CMSContentList },
                  { path: "content/:type/:id/edit", Component: CMSEditor },
                  { path: "media", Component: CMSMedia },
                  { path: "settings", Component: CMSSettings },
                ],
              },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate to="/login" replace /> },
    ],
  },
]);
