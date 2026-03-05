"use client";

import { useAuth } from "@/context/AuthContext";
import { useMatches } from "@/lib/hooks/useMatches";
import { teamLabel, teamColor, formatDate, statusLabel } from "@/lib/utils/helpers";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { Trophy, Gamepad2, TrendingUp, LogOut } from "lucide-react";

export default function PerfilPage() {
  const { user, signOut } = useAuth();
  const { matches } = useMatches();
  const router = useRouter();

  if (!user) return null;

  const myMatches = matches.filter((m) => m.players.includes(user.uid));
  const myWins = myMatches.filter((m) => m.winners.includes(user.uid));
  const tc = teamColor(user.team);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo!");
    router.push("/login");
  };

  const winRate = myMatches.length > 0
    ? Math.round((myWins.length / myMatches.filter(m => m.status === "finished").length) * 100) || 0
    : 0;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h1 className="font-display text-4xl text-gradient tracking-wide mb-8">MEU PERFIL</h1>

      {/* Profile card */}
      <div className="card p-6 mb-6" style={{ borderTop: `3px solid ${tc}` }}>
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
            style={{ background: tc + "25", color: tc }}
          >
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-coal-100">{user.name}</h2>
            <p className="text-coal-400 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full" style={{ background: tc }} />
              <span className="text-sm font-medium" style={{ color: tc }}>{teamLabel(user.team)}</span>
              {user.role === "admin" && (
                <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-coal-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-coal-100">{user.points}</div>
            <div className="text-coal-500 text-xs mt-1 flex items-center justify-center gap-1">
              <Trophy size={10} /> Pontos
            </div>
          </div>
          <div className="text-center border-x border-coal-700">
            <div className="text-3xl font-bold text-coal-100">{user.wins}</div>
            <div className="text-coal-500 text-xs mt-1 flex items-center justify-center gap-1">
              <TrendingUp size={10} /> Vitórias
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-coal-100">{myMatches.length}</div>
            <div className="text-coal-500 text-xs mt-1 flex items-center justify-center gap-1">
              <Gamepad2 size={10} /> Partidas
            </div>
          </div>
        </div>

        {myMatches.filter(m => m.status === "finished").length > 0 && (
          <div className="mt-4 pt-4 border-t border-coal-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-coal-400 text-sm">Taxa de vitória</span>
              <span className="text-coal-100 font-bold">{winRate}%</span>
            </div>
            <div className="h-2 bg-coal-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${winRate}%`, background: tc }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Match history */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-coal-100 mb-4">Histórico de Partidas</h2>
        {myMatches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-coal-500 text-sm">Nenhuma partida ainda</p>
            <Link href="/jogos" className="btn-primary mt-3 inline-block text-sm">Ver Partidas Disponíveis</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myMatches.map((m) => {
              const won = m.winners.includes(user.uid);
              return (
                <Link key={m.id} href={`/jogos/${m.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-coal-800 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{won ? "🏆" : m.status === "active" ? "⚔️" : "🎲"}</span>
                    <div>
                      <div className="font-medium text-coal-100 text-sm">{m.gameName}</div>
                      <div className="text-coal-500 text-xs">{formatDate(m.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.status === "finished" && won && <span className="text-amber-400 text-xs font-bold">+1 pt</span>}
                    <span className={`badge-${m.status} text-xs`}>{statusLabel(m.status)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={handleSignOut} className="btn-secondary w-full flex items-center justify-center gap-2 text-red-400 border-red-400/20 hover:border-red-400/40">
        <LogOut size={16} /> Sair da conta
      </button>
    </div>
  );
}
