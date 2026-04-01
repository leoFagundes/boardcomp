"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { teamColor, teamLabel } from "@/lib/utils/helpers";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils/helpers";
import {
  LayoutDashboard,
  Gamepad2,
  Trophy,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/jogos", label: "Jogos", icon: Gamepad2 },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo!");
    router.push("/login");
  };

  const tc = user ? teamColor(user.team) : "#F59E0B";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-coal-900/90 backdrop-blur-md border-b border-coal-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-base overflow-visible">
              <img src="images/logo-circle.png" />
            </div>
            <span className="font-display text-2xl text-gradient tracking-wider hidden sm:block">
              TORNEIO CARCASSONNE
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-coal-300 hover:text-coal-100 hover:bg-coal-800",
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  pathname.startsWith("/admin")
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-coal-300 hover:text-coal-100 hover:bg-coal-800",
                )}
              >
                <ShieldCheck size={16} />
                Admin
              </Link>
            )}
          </div>

          {/* User area */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: tc }}
                />
                <span className="text-xs text-coal-400 hidden lg:block">
                  {teamLabel(user.team)}
                </span>
                <span className="text-sm font-medium text-coal-200">
                  {user.name.split(" ")[0]}
                </span>
                <div className="flex items-center gap-1 bg-coal-800 rounded-full px-3 py-1 border border-coal-700">
                  <span className="text-amber-400 font-bold text-sm">
                    {user.points}
                  </span>
                  <span className="text-coal-400 text-xs">pts</span>
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="btn-ghost p-2 hidden md:flex"
            >
              <LogOut size={18} />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-ghost p-2 md:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-coal-700 bg-coal-900 px-4 pb-4 pt-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                  pathname === href
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-coal-300",
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-coal-300"
              >
                <ShieldCheck size={18} /> Admin
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-3 text-sm text-red-400 w-full"
            >
              <LogOut size={18} /> Sair
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
