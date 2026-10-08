"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { ThemeId, ThemeMode, ThemeDefinition } from "@/data/theme/types";
import { THEME_DEFINITIONS } from "@/data/theme/types";
import { getUserThemePreference, saveUserThemePreference } from "@/lib/api/theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  activeTheme: ThemeDefinition;
  themes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "academic-blue");
    const saved = localStorage.getItem("theplug-theme-mode") as ThemeMode | null;
    if (saved === "dark" || saved === "light") {
      setMode(saved);
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        setMode("dark");
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleMode = () => {
    const nextMode: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(nextMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("theplug-theme-mode", nextMode);
      if (nextMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("theplug-theme-mode", newMode);
      if (newMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const activeTheme = THEME_DEFINITIONS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme: "academic-blue",
        setTheme: () => {},
        mode,
        setMode: handleSetMode,
        toggleMode,
        activeTheme,
        themes: [THEME_DEFINITIONS[0]],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "academic-blue" as ThemeId,
      setTheme: () => {},
      mode: "light" as ThemeMode,
      setMode: () => {},
      toggleMode: () => {},
      activeTheme: THEME_DEFINITIONS[0],
      themes: [THEME_DEFINITIONS[0]],
    };
  }
  return ctx;
}
