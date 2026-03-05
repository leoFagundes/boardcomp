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
  return team === "antigos" ? "Funcionários Antigos" : "Funcionários Novos";
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

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    waiting: "#F59E0B",
    active: "#10B981",
    finished: "#6B7280",
  };
  return map[status] || "#6B7280";
}
