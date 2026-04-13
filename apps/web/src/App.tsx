import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <div className="public-app min-h-screen">
      <RouterProvider router={router} />
    </div>
  );
}
