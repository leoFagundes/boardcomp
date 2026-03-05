"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/helpers";
import { Gamepad2, Swords, Users, LayoutDashboard } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Visão Geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/jogos", label: "Jogos", icon: Gamepad2 },
  { href: "/admin/partidas", label: "Partidas", icon: Swords },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-coal-950 flex items-center justify-center">
        <div className="text-4xl animate-pulse-slow">🎲</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-coal-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Admin sub-nav */}
        <div className="flex items-center gap-1 mb-8 p-1.5 bg-coal-900 rounded-xl border border-coal-700 overflow-x-auto">
          {adminNav.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  active
                    ? "bg-amber-500 text-coal-950"
                    : "text-coal-400 hover:text-coal-100 hover:bg-coal-800"
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </div>
  );
}
