// ─── Theme API Layer (Backend-Ready) ──────────────────────────────────
// Async wrappers for user theme preferences.
// To connect to a real backend:
//   Replace body with `fetch("/api/user/theme-preferences", { method: "PUT", ... })`

import type { UserThemePreference, ThemeId, ThemeMode } from "@/data/theme/types";

const STORAGE_KEY_THEME = "theplug-theme-id";
const STORAGE_KEY_MODE = "theplug-theme-mode";

export async function getUserThemePreference(): Promise<UserThemePreference> {
  if (typeof window === "undefined") {
    return {
      themeId: "academic-blue",
      mode: "light",
      updatedAt: new Date().toISOString(),
    };
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY_THEME) as ThemeId | null;
  const storedMode = window.localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;

  return {
    themeId: storedTheme || "academic-blue",
    mode: storedMode || "light",
    updatedAt: new Date().toISOString(),
  };
}

export async function saveUserThemePreference(
  pref: Partial<UserThemePreference>
): Promise<UserThemePreference> {
  if (typeof window !== "undefined") {
    if (pref.themeId) {
      window.localStorage.setItem(STORAGE_KEY_THEME, pref.themeId);
    }
    if (pref.mode) {
      window.localStorage.setItem(STORAGE_KEY_MODE, pref.mode);
    }
  }

  // Simulated backend API response
  return {
    themeId: pref.themeId || "academic-blue",
    mode: pref.mode || "light",
    updatedAt: new Date().toISOString(),
  };
}
