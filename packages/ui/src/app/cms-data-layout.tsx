import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { CMSProvider, useCMS } from "./components/cms-data";
import { LoadingScreen } from "./components/loading-screen";

function CMSDataLayoutContent() {
  const { loading, error } = useCMS();

  if (loading) {
    return <LoadingScreen label="Carregando conteudo do CMS..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ backgroundColor: "#0a0a0a", color: "#fafafa" }}>
        <div>
          <h1 style={{ fontSize: "20px" }}>Erro ao carregar o CMS</h1>
          <p style={{ fontSize: "14px", color: "#888", marginTop: "8px" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}

export function CMSDataLayout() {
  return (
    <CMSProvider mode="cms">
      <CMSDataLayoutContent />
    </CMSProvider>
  );
}
