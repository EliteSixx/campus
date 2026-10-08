import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function statusForScore(score: number): "Strong" | "Developing" | "Skill Gap" {
  if (score >= 70) return "Strong";
  if (score >= 45) return "Developing";
  return "Skill Gap";
}

export function statusColor(status: "Strong" | "Developing" | "Skill Gap") {
  switch (status) {
    case "Strong":
      return { text: "text-success", bg: "bg-success-soft", bar: "bg-success" };
    case "Developing":
      return { text: "text-warning", bg: "bg-warning-soft", bar: "bg-warning" };
    case "Skill Gap":
      return { text: "text-danger", bg: "bg-danger-soft", bar: "bg-danger" };
  }
}
