import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { dataProvider } from "./components/data-provider";
import { LoadingScreen } from "./components/loading-screen";

interface CMSAuthState {
  loading: boolean;
  authenticated: boolean;
  user: any;
}

const CMSAuthContext = createContext<CMSAuthState>({
  loading: true,
  authenticated: false,
  user: null,
});

export function CMSAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CMSAuthState>({
    loading: true,
    authenticated: false,
    user: null,
  });

  useEffect(() => {
    let active = true;

    void dataProvider
      .getSession()
      .then((session) => {
        if (!active) return;
        setState({
          loading: false,
          authenticated: session.authenticated,
          user: session.user,
        });
      })
      .catch(() => {
        if (!active) return;
        setState({ loading: false, authenticated: false, user: null });
      });

    const { data } = dataProvider.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      setState({
        loading: false,
        authenticated: Boolean(session),
        user: session?.user ?? null,
      });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return <CMSAuthContext.Provider value={state}>{children}</CMSAuthContext.Provider>;
}

export function useCMSAuth() {
  return useContext(CMSAuthContext);
}

export function RequireCMSAuth() {
  const auth = useCMSAuth();
  const location = useLocation();

  if (auth.loading) {
    return <LoadingScreen label="Validando sessao..." />;
  }

  if (!auth.authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const auth = useCMSAuth();

  if (auth.loading) {
    return <LoadingScreen label="Carregando CMS..." />;
  }

  if (auth.authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
