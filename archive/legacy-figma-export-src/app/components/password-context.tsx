import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface PasswordContextType {
  isProjectUnlocked: (projectId: string) => boolean;
  unlockProject: (projectId: string) => void;
}

const PasswordContext = createContext<PasswordContextType>({
  isProjectUnlocked: () => false,
  unlockProject: () => {},
});

export function PasswordProvider({ children }: { children: ReactNode }) {
  // In-memory only — resets when the tab/browser is closed
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  const isProjectUnlocked = useCallback(
    (projectId: string) => unlockedIds.has(projectId),
    [unlockedIds]
  );

  const unlockProject = useCallback((projectId: string) => {
    setUnlockedIds((prev) => {
      const next = new Set(prev);
      next.add(projectId);
      return next;
    });
  }, []);

  return (
    <PasswordContext.Provider value={{ isProjectUnlocked, unlockProject }}>
      {children}
    </PasswordContext.Provider>
  );
}

export function usePassword() {
  return useContext(PasswordContext);
}
