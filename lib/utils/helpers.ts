import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: any): string {
  if (!date) return "—";
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function teamLabel(team: string): string {
  return team === "antigos" ? "Brasilberg" : "Hidromel";
}

export function teamColor(team: string): string {
  return team === "antigos" ? "#F59E0B" : "#3B82F6";
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    waiting: "Aguardando",
    active: "Em andamento",
    finished: "Finalizado",
  };
  return map[status] || status;
}

export function dicebearUrl(seed: string, style = "pixel-art", bg?: string): string {
  const bgParam = bg
    ? `backgroundColor=${bg.replace("#", "")}`
    : "backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf";
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&${bgParam}`;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    waiting: "#F59E0B",
    active: "#10B981",
    finished: "#6B7280",
  };
  return map[status] || "#6B7280";
}
