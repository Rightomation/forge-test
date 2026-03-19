import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Priority, LabelColor } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LABEL_COLORS: Record<LabelColor, { hex: string; label: string }> = {
  indigo: { hex: "#6366F1", label: "Indigo" },
  violet: { hex: "#8B5CF6", label: "Violet" },
  pink: { hex: "#EC4899", label: "Pink" },
  rose: { hex: "#F43F5E", label: "Rose" },
  orange: { hex: "#F97316", label: "Orange" },
  teal: { hex: "#14B8A6", label: "Teal" },
  sky: { hex: "#0EA5E9", label: "Sky" },
  lime: { hex: "#84CC16", label: "Lime" },
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  high: {
    label: "High",
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#FECACA",
    dot: "#EF4444",
  },
  medium: {
    label: "Medium",
    color: "#B45309",
    bg: "#FFFBEB",
    border: "#FDE68A",
    dot: "#F59E0B",
  },
  low: {
    label: "Low",
    color: "#065F46",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    dot: "#10B981",
  },
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isOverdue(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
