import { RouterProvider } from "react-router";
import { router } from "./routes";

// Portfolio app entry point
export default function App() {
  return <RouterProvider router={router} />;
}