export type ThemeId =
  | "academic-blue"
  | "corporate-blue"
  | "modern-academia"
  | "indigo-intelligence"
  | "academia-industry-bridge"
  | "future-ready"
  | "career-intelligence"
  | "skill-matrix"
  | "career-hub"
  | "emerald-growth"
  | "knowledge-teal"
  | "enterprise-navy"
  | "corporate-slate"
  | "executive-teal"
  | "ai-blue"
  | "digital-future"
  | "professional-cyan"
  | "institutional-navy-gold"
  | "professional-dark"
  | "midnight-intelligence"
  // Legacy aliases for backward compatibility
  | "academic-indigo"
  | "warm-neutral"
  | "dark-cyan"
  | "forest-gold";

export type ThemeMode = "dark" | "light";

export interface ThemeColors {
  neutralDark: string;
  neutralLight: string;
  accent: string;
  accentHover: string;
  secondary?: string;
  surface?: string;
  success: string;
  danger: string;
  warning: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  colors: ThemeColors;
  isDarkOnly?: boolean;
}

export interface UserThemePreference {
  themeId: ThemeId;
  mode: ThemeMode;
  updatedAt: string;
}

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: "academic-blue",
    name: "Academic Blue",
    tagline: "Professional university-oriented navy, royal blue & sky blue",
    colors: {
      neutralDark: "#12355B",
      neutralLight: "#F8FAFC",
      accent: "#1D4ED8",
      accentHover: "#1E40AF",
      secondary: "#60A5FA",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    tagline: "Enterprise & institutional management style with sapphire & cyan",
    colors: {
      neutralDark: "#0F172A",
      neutralLight: "#F8FAFC",
      accent: "#2563EB",
      accentHover: "#1D4ED8",
      secondary: "#06B6D4",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "modern-academia",
    name: "Modern Academia",
    tagline: "Modern university + technology aesthetic in royal blue & indigo",
    colors: {
      neutralDark: "#1E293B",
      neutralLight: "#F8FAFC",
      accent: "#1D4ED8",
      accentHover: "#1E40AF",
      secondary: "#4F46E5",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "indigo-intelligence",
    name: "Indigo Intelligence",
    tagline: "Analytics, AI-powered recommendations & skill intelligence",
    colors: {
      neutralDark: "#3730A3",
      neutralLight: "#EEF2FF",
      accent: "#4F46E5",
      accentHover: "#4338CA",
      secondary: "#8B5CF6",
      surface: "#FFFFFF",
      success: "#0D9488",
      danger: "#E11D48",
      warning: "#CA8A04",
    },
  },
  {
    id: "academia-industry-bridge",
    name: "Academia–Industry Bridge",
    tagline: "Bridging institutions & industry with slate, royal blue & deep teal",
    colors: {
      neutralDark: "#0F172A",
      neutralLight: "#F8FAFC",
      accent: "#0F766E",
      accentHover: "#115E59",
      secondary: "#2563EB",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "future-ready",
    name: "FutureReady",
    tagline: "Student employability, high-demand skills & career readiness",
    colors: {
      neutralDark: "#4338CA",
      neutralLight: "#F8FAFC",
      accent: "#2563EB",
      accentHover: "#1D4ED8",
      secondary: "#0D9488",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "career-intelligence",
    name: "Career Intelligence",
    tagline: "Placement analytics, recommendations & recruitment intelligence",
    colors: {
      neutralDark: "#0F172A",
      neutralLight: "#F1F5F9",
      accent: "#4F46E5",
      accentHover: "#4338CA",
      secondary: "#8B5CF6",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "skill-matrix",
    name: "SkillMatrix",
    tagline: "Skill assessment, skill gaps & institutional skill analytics",
    colors: {
      neutralDark: "#1E40AF",
      neutralLight: "#F8FAFC",
      accent: "#6366F1",
      accentHover: "#4F46E5",
      secondary: "#A855F7",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "career-hub",
    name: "CareerHub",
    tagline: "Internships, placements, and career development hub",
    colors: {
      neutralDark: "#1D4ED8",
      neutralLight: "#F8FAFC",
      accent: "#059669",
      accentHover: "#047857",
      secondary: "#60A5FA",
      surface: "#FFFFFF",
      success: "#059669",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "emerald-growth",
    name: "Emerald Growth",
    tagline: "Student growth, academic progress & career development",
    colors: {
      neutralDark: "#064E3B",
      neutralLight: "#ECFDF5",
      accent: "#059669",
      accentHover: "#047857",
      secondary: "#34D399",
      surface: "#FFFFFF",
      success: "#059669",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "knowledge-teal",
    name: "Knowledge Teal",
    tagline: "Education, learning & institutional development in fresh teal",
    colors: {
      neutralDark: "#0F766E",
      neutralLight: "#F0FDFA",
      accent: "#14B8A6",
      accentHover: "#0D9488",
      secondary: "#99F6E4",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "enterprise-navy",
    name: "Enterprise Navy",
    tagline: "Formal institutional & enterprise command dashboard",
    colors: {
      neutralDark: "#0F172A",
      neutralLight: "#F8FAFC",
      accent: "#1E40AF",
      accentHover: "#1D4ED8",
      secondary: "#3B82F6",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "corporate-slate",
    name: "Corporate Slate",
    tagline: "Professional data-heavy dashboard with slate & sapphire",
    colors: {
      neutralDark: "#1E293B",
      neutralLight: "#F1F5F9",
      accent: "#2563EB",
      accentHover: "#1D4ED8",
      secondary: "#64748B",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "executive-teal",
    name: "Executive Teal",
    tagline: "Professional institutional + industry collaboration aesthetic",
    colors: {
      neutralDark: "#134E4A",
      neutralLight: "#F0FDFA",
      accent: "#0F766E",
      accentHover: "#115E59",
      secondary: "#2DD4BF",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "ai-blue",
    name: "AI Blue",
    tagline: "Modern intelligent analytics dashboard with electric cyan",
    colors: {
      neutralDark: "#172554",
      neutralLight: "#EFF6FF",
      accent: "#2563EB",
      accentHover: "#1D4ED8",
      secondary: "#06B6D4",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "digital-future",
    name: "Digital Future",
    tagline: "Technology-forward institutional dashboard with indigo & cyan",
    colors: {
      neutralDark: "#0F172A",
      neutralLight: "#E0F2FE",
      accent: "#4F46E5",
      accentHover: "#4338CA",
      secondary: "#06B6D4",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "professional-cyan",
    name: "Professional Cyan",
    tagline: "Clean, modern and data-oriented cyan palette",
    colors: {
      neutralDark: "#164E63",
      neutralLight: "#F0F9FF",
      accent: "#0891B2",
      accentHover: "#0E7490",
      secondary: "#67E8F9",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#D97706",
    },
  },
  {
    id: "institutional-navy-gold",
    name: "Institutional Navy & Gold",
    tagline: "Formal university identity with dignified gold highlights",
    colors: {
      neutralDark: "#172554",
      neutralLight: "#F8FAFC",
      accent: "#1E40AF",
      accentHover: "#1D4ED8",
      secondary: "#B45309",
      surface: "#FFFFFF",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#B45309",
    },
  },
  {
    id: "professional-dark",
    name: "Professional Dark",
    tagline: "Dark-mode interface for institutions preferring deep contrast",
    isDarkOnly: true,
    colors: {
      neutralDark: "#0F172A",
      neutralLight: "#F8FAFC",
      accent: "#3B82F6",
      accentHover: "#60A5FA",
      secondary: "#38BDF8",
      surface: "#1E293B",
      success: "#22C55E",
      danger: "#EF4444",
      warning: "#F59E0B",
    },
  },
  {
    id: "midnight-intelligence",
    name: "Midnight Intelligence",
    tagline: "Deep dark AI & analytics theme with subtle indigo & cyan",
    isDarkOnly: true,
    colors: {
      neutralDark: "#020617",
      neutralLight: "#E2E8F0",
      accent: "#4F46E5",
      accentHover: "#6366F1",
      secondary: "#06B6D4",
      surface: "#0F172A",
      success: "#22C55E",
      danger: "#EF4444",
      warning: "#F59E0B",
    },
  },
];
