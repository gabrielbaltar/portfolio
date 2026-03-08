import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const UNLOCKED_IDS_STORAGE_KEY = "portfolio-unlocked-content";

function readUnlockedIds() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const raw = window.sessionStorage.getItem(UNLOCKED_IDS_STORAGE_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(parsed.filter((value): value is string => typeof value === "string" && value.trim() !== ""));
  } catch {
    return new Set<string>();
  }
}

function writeUnlockedIds(value: Set<string>) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(UNLOCKED_IDS_STORAGE_KEY, JSON.stringify(Array.from(value)));
  } catch {
    // Ignore storage failures and keep the in-memory unlock state.
  }
}

interface PasswordContextType {
  isProjectUnlocked: (projectId: string) => boolean;
  unlockProject: (projectId: string) => void;
}

const PasswordContext = createContext<PasswordContextType>({
  isProjectUnlocked: () => false,
  unlockProject: () => {},
});

export function PasswordProvider({ children }: { children: ReactNode }) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => readUnlockedIds());

  const isProjectUnlocked = useCallback(
    (projectId: string) => unlockedIds.has(projectId),
    [unlockedIds]
  );

  const unlockProject = useCallback((projectId: string) => {
    setUnlockedIds((prev) => {
      const next = new Set(prev);
      next.add(projectId);
      writeUnlockedIds(next);
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
